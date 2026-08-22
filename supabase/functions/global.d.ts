// Ambient type definitions for Supabase Edge Functions (Deno runtime) in IDEs

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    has(key: string): boolean;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  }

  export const env: Env;

  export const version: {
    deno: string;
    v8: string;
    typescript: string;
  };

  export function serve(
    handler: (req: Request) => Response | Promise<Response> | Promise<Response | undefined>
  ): void;
}

declare module "https://deno.land/std@*" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response> | Promise<Response | undefined>
  ): void;
}

declare module "https://esm.sh/@supabase/supabase-js@*" {
  export * from "@supabase/supabase-js";
}

declare module "https://esm.sh/*" {
  const content: any;
  export default content;
  export * from "@supabase/supabase-js";
}
