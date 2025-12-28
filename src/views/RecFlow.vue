<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <span class="text-uppercase page-subtitle">Overview</span>
        <h3 class="page-title">Recommendation Flow</h3>
      </div>
    </div>

    <!-- LogicFlow Container -->
    <div class="card card-small mb-4">
      <div class="card-body p-0">
        <div id="container" class="logic-flow-view"></div>
      </div>
    </div>
  </div>
</template>

<script>
import LogicFlow from '@logicflow/core';
import '@logicflow/core/dist/index.css';
import dagre from 'dagre';

export default {
  data() {
    return {
      lf: null,
    };
  },
  mounted() {
    this.lf = new LogicFlow({
      container: document.querySelector('#container'),
      grid: true,
    });

    const nodes = [
      { id: '1', type: 'rect', text: 'Start' },
      { id: '2', type: 'rect', text: 'Filter' },
      { id: '3', type: 'rect', text: 'Rank' },
      { id: '4', type: 'rect', text: 'Re-rank' },
      { id: '5', type: 'rect', text: 'End' },
    ];

    const edges = [
      { sourceNodeId: '1', targetNodeId: '2' },
      { sourceNodeId: '2', targetNodeId: '3' },
      { sourceNodeId: '2', targetNodeId: '4' },
      { sourceNodeId: '3', targetNodeId: '5' },
      { sourceNodeId: '4', targetNodeId: '5' },
    ];

    const layoutedData = this.layout(nodes, edges);

    // 渲染数据
    this.lf.render(layoutedData);

    // 居中显示
    this.lf.translateCenter();
  },
  methods: {
    layout(nodes, edges) {
      const g = new dagre.graphlib.Graph();
      g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 100 });
      g.setDefaultEdgeLabel(() => ({}));

      nodes.forEach((node) => {
        g.setNode(node.id, { width: 100, height: 40 });
      });

      edges.forEach((edge) => {
        g.setEdge(edge.sourceNodeId, edge.targetNodeId);
      });

      dagre.layout(g);

      const layoutedNodes = nodes.map((node) => {
        const pos = g.node(node.id);
        return {
          ...node,
          x: pos.x,
          y: pos.y,
        };
      });

      return { nodes: layoutedNodes, edges };
    },
  },
};
</script>

<style scoped>
.logic-flow-view {
  height: 75vh;
  width: 100%;
}
</style>
