// types.d.ts

import 'next-auth';

declare module 'next-auth' {
  interface User {
    id?: string;
    email?: string | null;
    isAdmin?: boolean;
    name?: string | null;
    provider?: string;
  }
  
  interface Session {
    user?: User;
  }
}
