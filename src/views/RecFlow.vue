<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-4 text-center text-sm-left mb-0">
        <h3 class="page-title">RecFlow Editor</h3>
      </div>
    </div>

    <!-- LogicFlow Container -->
    <div class="card card-small mb-4">
      <div class="card-body p-0">
        <div id="container" class="logic-flow-view"></div>
      </div>
    </div>

    <!-- Node Property Modal -->
    <d-modal v-if="showNodeModal" @close="closeNodeModal" centered>
      <d-modal-header>
        <d-modal-title>{{ modalTitle }}</d-modal-title>
      </d-modal-header>
      <d-modal-body>
        <d-form @submit.prevent="updateNode">
          <!-- Node Name (Text) -->
          <div class="form-group" v-if="!nodeForm.properties.fixedName">
            <label for="nodeText">Name</label>
            <d-input id="nodeText" v-model="nodeForm.text" />
          </div>

          <!-- Data Source Specific Properties -->
          <template v-if="nodeForm.properties.recommend && nodeForm.properties.recommend.data_source">
            <div class="form-group">
              <label>Positive Feedback Types (comma separated)</label>
              <d-input :value="nodeForm.properties.recommend.data_source.positive_feedback_types.join(',')" 
                       @input="val => nodeForm.properties.recommend.data_source.positive_feedback_types = val.split(',').map(s => s.trim())" />
            </div>
            <div class="form-group">
              <label>Read Feedback Types (comma separated)</label>
              <d-input :value="nodeForm.properties.recommend.data_source.read_feedback_types.join(',')" 
                       @input="val => nodeForm.properties.recommend.data_source.read_feedback_types = val.split(',').map(s => s.trim())" />
            </div>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Positive Feedback TTL</label>
                <d-input type="number" v-model.number="nodeForm.properties.recommend.data_source.positive_feedback_ttl" />
              </div>
              <div class="form-group col-md-6">
                <label>Item TTL</label>
                <d-input type="number" v-model.number="nodeForm.properties.recommend.data_source.item_ttl" />
              </div>
            </div>
          </template>

          <!-- Collaborative Specific Properties -->
          <template v-if="nodeForm.properties.recommend && nodeForm.properties.recommend.collaborative">
            <h6 class="border-bottom pb-2 mb-3">Collaborative Settings</h6>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Fit Period</label>
                <d-input v-model="nodeForm.properties.recommend.collaborative.fit_period" />
              </div>
              <div class="form-group col-md-6">
                <label>Fit Epoch</label>
                <d-input type="number" v-model.number="nodeForm.properties.recommend.collaborative.fit_epoch" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Optimize Period</label>
                <d-input v-model="nodeForm.properties.recommend.collaborative.optimize_period" />
              </div>
              <div class="form-group col-md-6">
                <label>Optimize Trials</label>
                <d-input type="number" v-model.number="nodeForm.properties.recommend.collaborative.optimize_trials" />
              </div>
            </div>
            <div class="form-group">
              <label>Early Stopping Patience</label>
              <d-input type="number" v-model.number="nodeForm.properties.recommend.collaborative.early_stopping.patience" />
            </div>
          </template>

          <!-- Non-Personalized Specific Properties -->
          <template v-if="nodeForm.properties.recommend && nodeForm.properties.recommend.non_personalized">
            <h6 class="border-bottom pb-2 mb-3">Non-Personalized Settings</h6>
            <div v-for="(item, index) in nodeForm.properties.recommend.non_personalized" :key="index" class="mb-3 p-2 border rounded">
              <div class="form-group">
                <label>Internal Name</label>
                <d-input v-model="item.name" />
              </div>
              <div class="form-group">
                <label>Score Formula</label>
                <d-input v-model="item.score" />
              </div>
              <div class="form-group">
                <label>Filter Expression</label>
                <d-input v-model="item.filter" />
              </div>
            </div>
          </template>

          <div class="text-right pt-3">
            <d-button type="button" theme="secondary" class="mr-2" @click="closeNodeModal">Cancel</d-button>
            <d-button type="submit" theme="primary">Save</d-button>
          </div>
        </d-form>
      </d-modal-body>
    </d-modal>
  </div>
</template>

<script>
import LogicFlow, { HtmlNode, HtmlNodeModel } from '@logicflow/core';
import '@logicflow/core/dist/index.css';
import dagre from 'dagre';

class IconNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 150;
    this.height = 50;
    this.text.editable = false;
  }

  getTextStyle() {
    const style = super.getTextStyle();
    style.display = 'none';
    return style;
  }
}

class IconNode extends HtmlNode {
  setHtml(rootEl) {
    const { properties, text } = this.props.model;
    const el = document.createElement('div');
    el.className = 'card';

    // Determine icon based on text or properties
    let iconName = 'settings'; // Default icon
    const nodeText = text ? (typeof text === 'object' ? text.value : text) : '';

    if (nodeText.toLowerCase().includes('data source')) iconName = 'database';
    else if (nodeText.toLowerCase().includes('start')) iconName = 'play_circle_filled';
    else if (nodeText.toLowerCase().includes('end')) iconName = 'stop';
    else if (nodeText.toLowerCase().includes('filter')) iconName = 'filter_alt';
    else if (nodeText.toLowerCase().includes('rank')) iconName = 'sort';
    else if (nodeText.toLowerCase().includes('latest')) iconName = 'new_releases';
    else if (nodeText.toLowerCase().includes('user to user')) iconName = 'people';
    else if (nodeText.toLowerCase().includes('item to item')) iconName = 'apps';
    else if (nodeText.toLowerCase().includes('collaborative')) iconName = 'group_work';
    else if (nodeText.toLowerCase().includes('nonpersonalized')) iconName = 'public';

    const html = `
      <div class="card-body d-flex align-items-center p-2 shadow-sm rounded border bg-white" style="height: 50px; width: 220px;">
        <i class="material-icons mr-2 text-primary" style="font-size: 20px;">${iconName === 'database' ? 'storage' : iconName}</i>
        <span class="text-dark font-weight-bold text-truncate" style="font-size: 14px;">${nodeText}</span>
      </div>
    `;
    el.innerHTML = html;
    rootEl.appendChild(el);
  }
}

export default {
  data() {
    return {
      lf: null,
      showNodeModal: false,
      nodeForm: {
        id: '',
        text: '',
        properties: {},
      },
    };
  },
  computed: {
    modalTitle() {
      if (this.nodeForm.properties && this.nodeForm.properties.recommend) {
        if (this.nodeForm.properties.recommend.data_source) {
          return 'Edit Data Source';
        }
        if (this.nodeForm.properties.recommend.collaborative) {
          return 'Edit Collaborative';
        }
        if (this.nodeForm.properties.recommend.non_personalized) {
          return 'Edit Non-Personalized';
        }
      }
      return 'Edit Node';
    },
  },
  mounted() {
    this.lf = new LogicFlow({
      container: document.querySelector('#container'),
      grid: true,
      nodeTextEdit: false,
      edgeTextEdit: false,
    });

    this.lf.register({
      type: 'icon-node',
      view: IconNode,
      model: IconNodeModel,
    });

    const nodes = [
      { 
        id: '1', 
        type: 'icon-node', 
        text: 'Data Source',
        properties: {
          fixedName: true,
          recommend: {
            data_source: {
              positive_feedback_types: ["star", "like", "read>=3"],
              read_feedback_types: ["read"],
              positive_feedback_ttl: 0,
              item_ttl: 0
            }
          }
        }
      },
      { id: '6', type: 'icon-node', text: 'Latest', properties: { readOnly: true } },
      { 
        id: '7', 
        type: 'icon-node', 
        text: 'Collaborative', 
        properties: { 
          fixedName: true,
          recommend: {
            collaborative: {
              fit_period: "60m",
              fit_epoch: 100,
              optimize_period: "360m",
              optimize_trials: 10,
              early_stopping: {
                patience: 10
              }
            }
          }
        } 
      },
      {
        id: '8',
        type: 'icon-node',
        text: 'NonPersonalized',
        properties: {
          recommend: {
            non_personalized: [
              {
                name: "most_liked_weekly",
                score: "count(feedback, .FeedbackType == 'like')",
                filter: "(now() - item.Timestamp).Hours() < 24 * 7"
              }
            ]
          }
        }
      },
      { id: '9', type: 'icon-node', text: 'User to User' },
      { id: '10', type: 'icon-node', text: 'Item to Item' },
    ];

    const edges = [
      { sourceNodeId: '1', targetNodeId: '6', type: 'bezier' },
      { sourceNodeId: '1', targetNodeId: '7', type: 'bezier' },
      { sourceNodeId: '1', targetNodeId: '8', type: 'bezier' },
      { sourceNodeId: '1', targetNodeId: '9', type: 'bezier' },
      { sourceNodeId: '1', targetNodeId: '10', type: 'bezier' },
    ];

    const layoutedData = this.layout(nodes, edges);

    // 渲染数据
    this.lf.render(layoutedData);

    // 居中显示
    this.lf.translateCenter();

    // Event Listeners
    this.lf.on('node:dbclick', this.handleNodeDbClick);
  },
  methods: {
    layout(nodes, edges) {
      const g = new dagre.graphlib.Graph();
      g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 120 });
      g.setDefaultEdgeLabel(() => ({}));

      nodes.forEach((node) => {
        g.setNode(node.id, { width: 160, height: 60 });
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
    handleNodeDbClick({ data }) {
      if (data.properties && data.properties.readOnly) {
        return;
      }
      this.nodeForm = JSON.parse(JSON.stringify({
        id: data.id,
        text: data.text ? (typeof data.text === 'object' ? data.text.value : data.text) : '',
        properties: data.properties || {},
      }));
      this.showNodeModal = true;
    },
    closeNodeModal() {
      this.showNodeModal = false;
    },
    updateNode() {
      if (this.nodeForm.id) {
        this.lf.updateText(this.nodeForm.id, this.nodeForm.text);
        this.lf.setProperties(this.nodeForm.id, this.nodeForm.properties);
        
        // Force refresh node view to update icon/text if needed (HtmlNode doesn't always auto-update efficiently on property change without a trigger)
        // A simple way is to re-render, but updateText should trigger re-render of that node. 
        // LogicFlow handles this, but for HtmlNode, sometimes custom DOM manipulation needs care.
        // The setHtml method reads from props.model which should be updated.
      }
      this.closeNodeModal();
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
