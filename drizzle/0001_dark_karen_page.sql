CREATE TABLE `tipos_cita` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`duracion_franjas` integer DEFAULT 1 NOT NULL,
	`precio` integer NOT NULL,
	`activo` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_franjas` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`startTime` text NOT NULL,
	`endTime` text NOT NULL,
	`available` integer DEFAULT true NOT NULL,
	`locked_until` integer,
	`cita_id` text,
	FOREIGN KEY (`cita_id`) REFERENCES `citas`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_franjas`("id", "date", "startTime", "endTime", "available", "locked_until", "cita_id") SELECT "id", "date", "startTime", "endTime", "available", "locked_until", "cita_id" FROM `franjas`;--> statement-breakpoint
DROP TABLE `franjas`;--> statement-breakpoint
ALTER TABLE `__new_franjas` RENAME TO `franjas`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_pagos` (
	`id` text PRIMARY KEY NOT NULL,
	`cita_id` text NOT NULL,
	`mercado_pago_id` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text NOT NULL,
	`creado_en` integer NOT NULL,
	FOREIGN KEY (`cita_id`) REFERENCES `citas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_pagos`("id", "cita_id", "mercado_pago_id", "amount", "status", "creado_en") SELECT "id", "cita_id", "mercado_pago_id", "amount", "status", "creado_en" FROM `pagos`;--> statement-breakpoint
DROP TABLE `pagos`;--> statement-breakpoint
ALTER TABLE `__new_pagos` RENAME TO `pagos`;--> statement-breakpoint
CREATE UNIQUE INDEX `pagos_mercado_pago_id_unique` ON `pagos` (`mercado_pago_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `pacientes_email_unique` ON `pacientes` (`email`);--> statement-breakpoint
CREATE TABLE `__new_citas` (
	`id` text PRIMARY KEY NOT NULL,
	`paciente_id` text NOT NULL,
	`tipo_cita_id` text NOT NULL,
	`estado_cita` text DEFAULT 'pendiente' NOT NULL,
	`estado_pago` text DEFAULT 'pendiente' NOT NULL,
	`notas_cliente` text,
	`creado_en` integer NOT NULL,
	FOREIGN KEY (`paciente_id`) REFERENCES `pacientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tipo_cita_id`) REFERENCES `tipos_cita`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_citas`("id", "paciente_id", "tipo_cita_id", "estado_cita", "estado_pago", "notas_cliente", "creado_en") SELECT "id", "paciente_id", "tipo_cita_id", "estado_cita", "estado_pago", "notas_cliente", "creado_en" FROM `citas`;--> statement-breakpoint
DROP TABLE `citas`;--> statement-breakpoint
ALTER TABLE `__new_citas` RENAME TO `citas`;