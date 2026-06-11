let currentIdServicio: string | null = null;

export const incidentStore = {
  setServicioId(id: string | number) {
    currentIdServicio = String(id);
  },
  getServicioId(): string | null {
    return currentIdServicio;
  },
  clear() {
    currentIdServicio = null;
  },
};
