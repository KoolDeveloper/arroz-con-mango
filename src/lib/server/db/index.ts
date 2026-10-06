import {drizzle} from 'drizzle-orm/d1';

export function getDb(platform : App.Platform){
    return drizzle(platform.env.therapist_db);
}