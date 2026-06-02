import { z } from "zod";
import { DSL, Path } from "../../../domain/index";

export const CompilePathRequest = z.object({
  path: Path,
});

export const CompilePathResponse = z.object({
  dsl: DSL,
});
