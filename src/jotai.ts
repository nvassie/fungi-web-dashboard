import { atom } from "jotai";
import type { FileInfo } from "./types";

export const fileInfoAtom = atom<FileInfo>();

export const fileContentAtom = atom<string>();

export const loadingAtom = atom<boolean>(false);
