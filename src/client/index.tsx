/**
 * dsh-plugin-template — Client plugin entry (browser half).
 *
 * Mounts the greet Remote namespace, registers locale dictionaries, and
 * injects one conversation.view tab that renders the greet result.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { DSH_TEMPLATE_REMOTE } from './remote.ts'
import { NS, en, zh } from './locales.ts'
import { TemplateView, type GreetActions, type TemplateViewSlotProps } from './view.tsx'
import { adoptStyles } from './styles.ts'

/** Required services: the Remote gateway, locale, and slots. */
export const inject = ['slots', 'remote', 'locale']

/** Compose the greet view tab. @param ctx - client root context. */
export function apply(ctx: ClientContext): void {
  adoptStyles()
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-plugin-template: dictionaries')

  let greet: unknown
  const t = ctx.locale.bind(NS)

  ctx.effect(async () => {
    const dispose = await ctx.remote.$mount(DSH_TEMPLATE_REMOTE)
    greet = (ctx.reflect as unknown as { get(name: string): unknown }).get('remote.greet')
    if (greet === undefined) throw new Error('dsh-plugin-template: the greet Remote namespace did not mount')
    return () => { greet = undefined; void dispose() }
  }, 'dsh-plugin-template: remote')

  const actions: GreetActions = {
    greet: (name: string) => {
      if (greet === undefined) return Promise.reject(new Error('dsh-plugin-template: greet Remote is not mounted'))
      const fn = (greet as Record<string, unknown>).greet
      if (typeof fn !== 'function') return Promise.reject(new Error('dsh-plugin-template: greet method is not available'))
      return (fn as (n: string) => unknown)(name) as ReturnType<GreetActions['greet']>
    },
  }

  // Register the greet tab into the session conversation view ring.
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'dsh-plugin-template',
    order: 20,
    label: () => t('view.label'),
    inject: () => ({ actions, t }),
  }, (props: TemplateViewSlotProps) => <TemplateView actions={props.actions} t={props.t} />))
}
