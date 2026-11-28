-- Login sin contraseña (código por correo + Google): el hash de contraseñas no cabe
-- en los 10 ms de CPU del plan gratuito de Workers.
DROP TABLE `tokens_recuperacion`;--> statement-breakpoint
ALTER TABLE `usuarios` DROP COLUMN `password_hash`;--> statement-breakpoint
ALTER TABLE `usuarios` DROP COLUMN `email_verificado`;--> statement-breakpoint
CREATE TABLE `codigos_acceso` (
	`email` text PRIMARY KEY NOT NULL,
	`codigo_hash` text NOT NULL,
	`intentos` integer DEFAULT 0 NOT NULL,
	`creado_en` integer NOT NULL,
	`expira_en` integer NOT NULL
);
