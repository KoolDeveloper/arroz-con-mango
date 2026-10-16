
export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'finalizada';

export type EstadoPago = 'pendiente' | 'aprobado' | 'cancelado' | 'reembolsado';

export type TipoCita = {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    duracion: number;
    activo: boolean;
};

export type Cliente = {
    id: string;
    nombre: string;
    correo: string;
    telefono?: string;

    creadoEn: Date;
    esUsuarioRegistrado: boolean;
    passwordHash?: string;
}

export type Franja = {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    available: boolean;

    citaId?: string;
};

export type Cita = {
    id: string;
    clienteId: string;
    franjaId: string;
    tipo: TipoCita;
    estado: EstadoCita;

    notasCliente?: string;
    notasMentor?: string;
    enlaceReunion?: string;
    creadoEn: Date;
    actualizadoEn: Date;
};

export type Pago = {
    id: string;
    citaId: string;
    mercadoPagoId: string;
    monto: number;
    estado: EstadoPago;
    metodoPago: string;
    creadoEn: Date;
    actualizadoEn: Date;
};