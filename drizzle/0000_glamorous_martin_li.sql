CREATE TABLE `citas` (
	`id` text PRIMARY KEY NOT NULL,
	`paciente_id` text NOT NULL,
	`pago_id` text,
	`estado_cita` text DEFAULT 'pendiente' NOT NULL,
	`estado_pago` text DEFAULT 'pendiente' NOT NULL,
	`tipo_cita_id` text NOT NULL,
	`notas_cliente` text,
	`creado_en` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `franjas` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`startTime` text NOT NULL,
	`endTime` text NOT NULL,
	`available` integer DEFAULT true NOT NULL,
	`cita_id` text
);
--> statement-breakpoint
CREATE TABLE `pacientes` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`telefono` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pagos` (
	`id` text PRIMARY KEY NOT NULL,
	`cita_id` text NOT NULL,
	`mercado_pago_id` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text NOT NULL
);
