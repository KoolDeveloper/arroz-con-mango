class AppState {
    // Arranca en true porque al abrir la web por primera vez queremos mostrar la carga
    isInitialLoading = $state(true);

    finishLoading() {
        this.isInitialLoading = false;
    }
}

export const appState = new AppState();