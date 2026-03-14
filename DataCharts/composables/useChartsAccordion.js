import { reactive } from 'vue';

export function useChartsAccordion(initialState = {}) {
    const sectionsOpen = reactive({
        origen: false,
        ejes: false,
        agrupacion: false,
        contexto: true,
        visualizacion: false,
        escala: false,
        series: false,
        ...initialState
    });

    const toggleSection = (section) => {
        const isOpen = sectionsOpen[section];
        // Colapsar todos para efecto acordeón
        Object.keys(sectionsOpen).forEach(key => {
            sectionsOpen[key] = false;
        });
        if (!isOpen) {
            sectionsOpen[section] = true;
        }
    };

    return {
        sectionsOpen,
        toggleSection
    };
}
