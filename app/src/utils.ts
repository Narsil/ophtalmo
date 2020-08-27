import * as FileSystem from "expo-file-system";
import { Info } from "./store/patients/types";

export async function writeInfo(info: Info, filename: string) {
    FileSystem.writeAsStringAsync(filename, JSON.stringify(info));
}
