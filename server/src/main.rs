use std::io::Write;

use actix_multipart::Multipart;
use actix_web::{middleware, web, App, Error, HttpResponse, HttpServer, ResponseError};
use futures::{StreamExt, TryStreamExt};
use std::fmt;
use std::fs;
use std::fs::File;
use std::path::Path;
use std::{
    io,
    io::{Seek, SeekFrom},
};

#[derive(Debug)]
enum CustomError {
    FileMissing,
    PatientMissing,
    InvalidField,
}

impl fmt::Display for CustomError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CustomError::FileMissing => write!(f, "'file' is missing",),
            CustomError::PatientMissing => write!(f, "'patient' is missing",),
            CustomError::InvalidField => write!(f, "invalid field",),
        }
    }
}

impl ResponseError for CustomError {
    fn error_response(&self) -> HttpResponse {
        HttpResponse::BadRequest().finish()
    }
}

struct Data {
    patient: String,
    tmpfile: File,
    filename: String,
}

async fn receive(payload: &mut Multipart) -> Result<Data, Error> {
    let mut patient_bytes = Vec::<u8>::new();
    let mut tmpfile = web::block(|| tempfile::tempfile()).await.unwrap();
    let mut filename = "".to_string();
    let mut file_ok = false;
    let mut patient_ok = false;
    while let Ok(Some(mut field)) = payload.try_next().await {
        let content_type = field.content_disposition().unwrap();
        if let Some(name) = content_type.get_name() {
            match name {
                "patient" => {
                    while let Some(chunk) = field.next().await {
                        patient_bytes = chunk.unwrap().to_vec();
                    }
                    patient_ok = true
                }
                "file" => {
                    if let Some(fname) = content_type.get_filename() {
                        filename = fname.to_string();
                        while let Some(chunk) = field.next().await {
                            let data = chunk.unwrap();
                            // filesystem operations are blocking, we have to use threadpool
                            tmpfile = web::block(move || tmpfile.write_all(&data).map(|_| tmpfile))
                                .await?;
                        }
                        file_ok = true
                    }
                }
                _ => {
                    return Err(CustomError::InvalidField.into());
                }
            }
        }
    }
    if !file_ok {
        Err(CustomError::FileMissing.into())
    } else if !patient_ok {
        Err(CustomError::PatientMissing.into())
    } else {
        let patient = std::str::from_utf8(&patient_bytes).unwrap();
        Ok(Data {
            patient: patient.to_string(),
            tmpfile,
            filename,
        })
    }
}

async fn save_file(mut payload: Multipart) -> Result<HttpResponse, Error> {
    // iterate over multipart stream
    let data = receive(&mut payload).await?;
    let patient = data.patient;
    let filename = data.filename;
    let mut tmpfile = data.tmpfile;
    let directory = format!("./uploads/{}", patient);
    let filepath = format!("{}/{}", directory, filename);
    fs::create_dir_all(directory)?;
    tmpfile.seek(SeekFrom::Start(0)).unwrap();
    if Path::new(&filepath).exists() {
        Ok(HttpResponse::Ok().body("Already exists").into())
    } else {
        let mut writer = fs::File::create(&filepath)?;
        let perm = tmpfile.metadata()?.permissions();
        io::copy(&mut tmpfile, &mut writer)?;
        fs::set_permissions(filepath, perm)?;
        Ok(HttpResponse::Ok().body("Ok").into())
    }
}

fn index() -> HttpResponse {
    let html = r#"<html>
        <head><title>Upload Test</title></head>
        <body>
            <form target="/" method="post" enctype="multipart/form-data">
                <input type="file" multiple name="file"/>
                <input type="submit" value="Submit"></button>
            </form>
        </body>
    </html>"#;

    HttpResponse::Ok().body(html)
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "actix_server=info,actix_web=info");
    env_logger::init();

    let ip = "0.0.0.0:3000";

    HttpServer::new(|| {
        App::new().wrap(middleware::Logger::default()).service(
            web::resource("/")
                .route(web::get().to(index))
                .route(web::post().to(save_file)),
        )
    })
    .bind(ip)?
    .run()
    .await
}
