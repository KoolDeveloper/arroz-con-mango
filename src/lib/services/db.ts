import {drizzle} from 'drizzle-orm/d1';

export function getDb(env: App.Platform["env"]){
    return drizzle(env.DB);
}