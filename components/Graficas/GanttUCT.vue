<template>
  <div class="d-flex align-items-center p-3 grid gap-3">
    <button class="btn-primary" :onclick="collapseAll">Comprimir todo</button>
    <button class="btn-primary" :onclick="expandAll">Expandir todo</button>
  </div>
  <div ref="ganttContainer" style="width: 100%; height: 500px"></div>
</template>

<script>
import { onMounted, ref } from "vue";
import anychart from "anychart";

export default {
  name: "AnyChartGantt",
  props: {
    data: {
      type: Array,
      required: true,
    },
    tooltipFormatter: {
      type: Function,
    },
  },
  emits: ["clickRow"],
  setup(props, { emit }) {
    const ganttContainer = ref(null);
    let chart;

    const makeListenersPassive = () => {
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function (
        type,
        listener,
        options
      ) {
        if (type === "touchstart" || type === "mousewheel") {
          if (typeof options === "boolean") {
            options = { passive: true };
          } else if (typeof options === "object") {
            options.passive = true;
          } else {
            options = { passive: true };
          }
        }
        originalAddEventListener.call(this, type, listener, options);
      };
    };

    const createGanttChart = () => {
      anychart.format.inputLocale("es-es");
      anychart.format.outputLocale("es-es");
      chart = anychart.ganttProject();

      chart.data(props.data, "asTable");

      chart.rowStroke("1.5 var(--gantt-column-stroke)");
      chart.columnStroke("1.5 var(--gantt-column-stroke)");

      var header = chart.getTimeline().header();
      header.fill("var(--gantt-fill)");
      header.stroke("1.5 var(--gantt-column-stroke)");
      header.fontColor("var(--gantt-font-color)");
      header.level(1).fontWeight(600);

      chart.splitterPosition(400);
      const dataGrid = chart.dataGrid();

      dataGrid.headerFill("var(--gantt-fill)");
      dataGrid.columnStroke("1.5 var(--gantt-column-stroke)");

      dataGrid.column(0).title("No.").width(50).labels({ hAlign: "center" });
      var column_1 = chart.dataGrid().column(0);
      column_1.title().fontColor("var(--gantt-font-color)");
      column_1.title().fontWeight(700);
      column_1.labels().fontColor("var(--gantt-font-color)");
      column_1.labels().fontWeight(600);

      dataGrid.column(1).title("Nombre").width(345).labels({ hAlign: "center" });
      var column_2 = chart.dataGrid().column(1);
      column_2.title().fontColor("var(--gantt-font-color)");
      column_2.labels().fontColor("var(--gantt-font-color)");

      var parentTasks = chart.getTimeline().groupingTasks();
      parentTasks.normal().fill("var(--gantt-parentTasks-color)");
      parentTasks.selected().fill("var(--gantt-parentTasks-selected)");
      parentTasks.normal().stroke("var(--gantt-parentTasks-color)");
      parentTasks.selected().stroke("var(--gantt-parentTasks-selected)");
      
      var baselines = chart.getTimeline().baselines();
      baselines.normal().fill("var(--gantt-baselines)");
      baselines.normal().stroke(null);
      baselines.selected().fill("var(--gantt-baselines-selected)");
      baselines.selected().stroke(null);

      chart
        .getTimeline()
        .scale()
        .zoomLevels([
          [
            { unit: "month", count: 1 },
            { unit: "year", count: 1 },
          ],
        ]);

      chart
        .getTimeline()
        .tooltip()
        .format(function () {
          const item = this.item;
          return props.tooltipFormatter
            ? props.tooltipFormatter(item)
            : `
              Actual Start: ${item.get("actualStart")}
              Actual End: ${item.get("actualEnd")}`;
        });

      chart.getTimeline().groupingTasks().labels().enabled(false);
      chart.getTimeline().tasks().labels().enabled(false);

      chart.container(ganttContainer.value);
      chart.draw();

      chart.fitAll();

      chart.listen("rowClick", function (e) {
        emit("clickRow", e.item.get("id"));
      });

      chart.listen("rowMouseOver", function () {
        if (ganttContainer.value != null && ganttContainer.value) {
          ganttContainer.value.style.cursor = "pointer";
        }
      });
    };

    const collapseAll = () => {
      chart.collapseAll();
    };

    const expandAll = () => {
      chart.expandAll();
    };

    onMounted(() => {
      makeListenersPassive();
      if (props.data.length > 0) {
        createGanttChart();
        removeCredits();
      }
    });

    const removeCredits = () => {
      const elements = document.getElementsByClassName('anychart-credits');
      while (elements.length > 0) {
        elements[0].remove();
      }
    };

    return {
      ganttContainer,
      collapseAll,
      expandAll,
    };
  },
};
</script>

<style scoped>
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: #fff;
  background-color: #007bff;
  border-color: unset;
  padding: 3px 12px !important;
  border-radius: 10px !important;
  background: linear-gradient(
    90deg,
    var(--purple-sb) 0%,
    var(--bluelight-sb) 100%
  );
  cursor: pointer;
  border: none;
  outline: none;
  transition: transform 0.3s ease;
  margin: 5px;
  font-size: 12px;
}

.btn-primary:hover {
  background: var(--purple-sb);
}

.btn-primary:active {
  background: var(--purple-sb);
}
</style>
