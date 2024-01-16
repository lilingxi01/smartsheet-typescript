// This file contains the ProcedureCore class and the defineProcedure function.
// These modules are used to define SDK procedures that are used to interact with the Smartsheet API.

import { z, ZodSchema } from 'zod';
import { AxiosError } from 'axios';

export type FinalizedCaller<InputType, OutputType> = (input?: InputType) => Promise<OutputType>;
export type ProcedureActionParams<InputType, OutputType> = {
  input: InputType;
}
export type ProcedureAction<InputType, OutputType> = (params: ProcedureActionParams<InputType, OutputType>) => Promise<OutputType>;

/**
 * A class representing a ProcedureCore instance.
 *
 * @template InputType - The type of the input for the ProcedureCore instance.
 * @template OutputType - The type of the output for the ProcedureCore instance.
 */
class ProcedureCore<InputType = undefined, OutputType = void> {
  /**
   * Represents the input schema for validating the input data.
   *
   * @private
   */
  private readonly inputSchema: ZodSchema<InputType> | undefined;

  /**
   * Represents the output schema for validating the output data.
   *
   * @private
   */
  private readonly outputSchema: ZodSchema<OutputType> | undefined;

  /**
   * Creates a new instance of ProcedureCore.
   *
   * @param {Object} options - The options for the constructor.
   * @param {ZodSchema} options.inputSchema - The input schema for the constructor.
   * @param {ZodSchema} options.outputSchema - The output schema for the constructor.
   *
   * @example
   * const procedureCore = new ProcedureCore();
   *
   * @example
   * const procedureCore = new ProcedureCore({
   *   inputSchema: z.string(),
   *   outputSchema: z.number(),
   * });
   */
  constructor({ inputSchema, outputSchema }: {
    inputSchema?: ZodSchema<InputType>,
    outputSchema?: ZodSchema<OutputType>,
  } = {}) {
    this.inputSchema = inputSchema ?? undefined;
    this.outputSchema = outputSchema ?? undefined;
  }

  /**
   * Sets the input schema for the ProcedureCore instance.
   *
   * @param {ZodSchema} zodSchema - The input schema to be set.
   * @return {ProcedureCore} - A new ProcedureCore instance with the updated input schema.
   */
  input<T>(zodSchema: ZodSchema<T>): ProcedureCore<T, OutputType> {
    return new ProcedureCore<T, OutputType>({
      inputSchema: zodSchema,
      outputSchema: this.outputSchema,
    });
  }

  /**
   * Returns a new ProcedureCore instance with the given ZodSchema as the output schema.
   * @param {ZodSchema} zodSchema - The ZodSchema representing the output schema.
   * @returns {ProcedureCore} - A new ProcedureCore instance with the updated output schema.
   */
  output<U>(zodSchema: ZodSchema<U>): ProcedureCore<InputType, U> {
    return new ProcedureCore<InputType, U>({
      inputSchema: this.inputSchema,
      outputSchema: zodSchema,
    });
  }

  /**
   * Takes a procedure action and returns a finalized caller function.
   * The caller function will validate the input and output using optional schemas.
   *
   * @param {ProcedureAction} action - The procedure action to be executed.
   * @returns {FinalizedCaller} - The finalized caller function.
   * @throws {Error} - If the input fails validation based on the input schema.
   * @throws {Error} - If the output fails validation based on the output schema.
   */
  action(action: ProcedureAction<InputType, OutputType>): FinalizedCaller<InputType, OutputType> {
    return async (input) => {
      const inputSchema = this.inputSchema ?? z.undefined();
      const safeParsedInput = inputSchema.safeParse(input);
      if (!safeParsedInput.success) {
        throw new Error(safeParsedInput.error.message);
      }
      input = safeParsedInput.data;
      let output: Awaited<OutputType>;
      try {
        output = await action({
          input: input as InputType,
        });
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          console.error('Axios:', err.response);
          throw new Error(err.message);
        }
        if (err instanceof Error) {
          throw err;
        }
        throw new Error('Unknown error occurred while executing the procedure action.');
      }
      const outputSchema = this.outputSchema ?? z.void();
      const safeParsedOutput = outputSchema.safeParse(output);
      if (!safeParsedOutput.success) {
        throw new Error(safeParsedOutput.error.message);
      }
      return output;
    };
  }
}

type DefineProcedureOptions<InputType, OutputType> = {
  input?: ZodSchema<InputType>,
  output?: ZodSchema<OutputType>,
  action: ProcedureAction<InputType, OutputType>,
};

export const procedureCore = new ProcedureCore();

/**
 * Defines a procedure with given options.
 * @param {DefineProcedureOptions} options - The options for defining the procedure.
 * @param {object} options.input - The input schema for the procedure.
 * @param {object} options.output - The output schema for the procedure.
 * @param {Function} options.action - The action function to be executed by the procedure.
 * @returns {ProcedureCore} - The instance of ProcedureCore that represents the defined procedure.
 */
export function defineProcedure<InputType = undefined, OutputType = void>(
  options: DefineProcedureOptions<InputType, OutputType>,
): FinalizedCaller<InputType, OutputType> {
  const { input, output, action } = options;
  return new ProcedureCore({
    inputSchema: input,
    outputSchema: output,
  }).action(action);
}
