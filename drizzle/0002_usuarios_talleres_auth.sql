-- Migración escrita a mano (drizzle-kit pide confirmación interactiva para renombres).
-- pacientes -> usuarios, citas.paciente_id -> citas.usuario_id, auth + talleres.
--
-- D1 siempre aplica foreign keys y no permite borrar una tabla padre con filas hijas,
-- así que se reconstruye la cadena usuarios <- citas <- (franjas, pagos) completa:
-- se crean las tablas nuevas, se copian los datos, se borran las viejas de hijas a padres
-- y al final se renombran (SQLite reescribe las FK que apuntan a "__new_*").

-- Tablas nuevas independientes
CREATE TABLE `__new_usuarios` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`telefono` text,
	`password_hash` text,
	`google_id` text,
	`email_verificado` integer DEFAULT false NOT NULL,
	`creado_en` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `talleres` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`precio` integer NOT NULL,
	`descripcion` text DEFAULT '' NOT NULL,
	`contenido` text DEFAULT '' NOT NULL,
	`publicado` integer DEFAULT false NOT NULL,
	`creado_en` integer NOT NULL,
	`actualizado_en` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `__new_citas` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`tipo_cita_id` text NOT NULL,
	`estado_cita` text DEFAULT 'pendiente' NOT NULL,
	`estado_pago` text DEFAULT 'pendiente' NOT NULL,
	`notas_cliente` text,
	`creado_en` integer NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `__new_usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tipo_cita_id`) REFERENCES `tipos_cita`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `__new_franjas` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`startTime` text NOT NULL,
	`endTime` text NOT NULL,
	`available` integer DEFAULT true NOT NULL,
	`locked_until` integer,
	`cita_id` text,
	FOREIGN KEY (`cita_id`) REFERENCES `__new_citas`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `usuarios_talleres` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`taller_id` text NOT NULL,
	`estado` text DEFAULT 'pendiente' NOT NULL,
	`creado_en` integer NOT NULL,
	`aprobado_en` integer,
	FOREIGN KEY (`usuario_id`) REFERENCES `__new_usuarios`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`taller_id`) REFERENCES `talleres`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `__new_pagos` (
	`id` text PRIMARY KEY NOT NULL,
	`cita_id` text,
	`compra_taller_id` text,
	`mercado_pago_id` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text NOT NULL,
	`creado_en` integer NOT NULL,
	FOREIGN KEY (`cita_id`) REFERENCES `__new_citas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`compra_taller_id`) REFERENCES `usuarios_talleres`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `sesiones` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`expira_en` integer NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `__new_usuarios`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tokens_recuperacion` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`expira_en` integer NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `__new_usuarios`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- Copia de datos (de padres a hijas)
INSERT INTO `__new_usuarios`("id", "nombre", "email", "telefono") SELECT "id", "nombre", "email", "telefono" FROM `pacientes`;--> statement-breakpoint
INSERT INTO `__new_citas`("id", "usuario_id", "tipo_cita_id", "estado_cita", "estado_pago", "notas_cliente", "creado_en") SELECT "id", "paciente_id", "tipo_cita_id", "estado_cita", "estado_pago", "notas_cliente", "creado_en" FROM `citas`;--> statement-breakpoint
INSERT INTO `__new_franjas`("id", "date", "startTime", "endTime", "available", "locked_until", "cita_id") SELECT "id", "date", "startTime", "endTime", "available", "locked_until", "cita_id" FROM `franjas`;--> statement-breakpoint
INSERT INTO `__new_pagos`("id", "cita_id", "mercado_pago_id", "amount", "status", "creado_en") SELECT "id", "cita_id", "mercado_pago_id", "amount", "status", "creado_en" FROM `pagos`;--> statement-breakpoint

-- Borrado de tablas viejas (de hijas a padres)
DROP TABLE `pagos`;--> statement-breakpoint
DROP TABLE `franjas`;--> statement-breakpoint
DROP TABLE `citas`;--> statement-breakpoint
DROP TABLE `pacientes`;--> statement-breakpoint

-- Renombrado final
ALTER TABLE `__new_usuarios` RENAME TO `usuarios`;--> statement-breakpoint
ALTER TABLE `__new_citas` RENAME TO `citas`;--> statement-breakpoint
ALTER TABLE `__new_franjas` RENAME TO `franjas`;--> statement-breakpoint
ALTER TABLE `__new_pagos` RENAME TO `pagos`;--> statement-breakpoint

-- Índices
CREATE UNIQUE INDEX `usuarios_email_unique` ON `usuarios` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_google_id_unique` ON `usuarios` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `pagos_mercado_pago_id_unique` ON `pagos` (`mercado_pago_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_talleres_usuario_taller_unique` ON `usuarios_talleres` (`usuario_id`,`taller_id`);--> statement-breakpoint
CREATE INDEX `sesiones_usuario_idx` ON `sesiones` (`usuario_id`);
