/**
 * dsh-plugin-template — Shared strict Typert wire contract between the host
 * and browser halves.
 *
 * Every Remote method has one InvocationDescriptor here. The host manifest
 * (typert.ts) and the client Remote contribution (client/remote.ts) both
 * point at this same list, so host and client can never drift apart.
 */
import { z } from 'zod'
import type { InvocationDescriptor } from '@deepseek-ai/dsh-typert-protocol'

/** Wire codec for the caller's name. */
export const nameSchema = z.string().trim().min(1).max(200)
/** Wire codec for the greeting result projection. */
export const greetResultSchema = z.object({ message: z.string() }).readonly()

const json = (name: string, wire: string, typeSymbol: string, schema: z.ZodType) => ({
  name, wire, source: 'json' as const, codec: { mode: 'strict' as const, typeSymbol, create: () => schema },
})
const resultOf = (typeSymbol: string, schema: z.ZodType) => ({ mode: 'strict' as const, typeSymbol, create: () => schema })

const nameParameter = json('name', 'name', 'dsh-plugin-template#Name', nameSchema)
const greetResult = resultOf('dsh-plugin-template#GreetResult', greetResultSchema)

/** Strict Typert descriptors shared by the host and browser halves. */
export const DSH_TEMPLATE_INVOCATIONS: readonly InvocationDescriptor[] = [
  {
    id: 'dsh-plugin-template#greet/greet', service: 'greet', namespace: 'greet', method: 'greet', invocation: { kind: 'direct' },
    parameters: [nameParameter], cancellation: { parameter: 'signal' }, result: greetResult,
  },
]
