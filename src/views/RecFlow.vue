<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-8 text-center text-sm-left mb-0 d-flex align-items-center">
        <div class="d-flex align-items-center p-2 mr-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'Latest')">
          <i class="material-icons mr-2 text-primary">new_releases</i>
          <span>Latest</span>
        </div>
        <div class="d-flex align-items-center p-2 mr-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'Collaborative')">
          <i class="material-icons mr-2 text-primary">group_work</i>
          <span>Collaborative</span>
        </div>
        <div class="d-flex align-items-center p-2 mr-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'NonPersonalized')">
          <i class="material-icons mr-2 text-primary">public</i>
          <span>Non-Personalized</span>
        </div>
        <div class="d-flex align-items-center p-2 mr-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'User to User')">
          <i class="material-icons mr-2 text-primary">people</i>
          <span>User to User</span>
        </div>
        <div class="d-flex align-items-center p-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'Item to Item')">
          <i class="material-icons mr-2 text-primary">apps</i>
          <span>Item to Item</span>
        </div>
      </div>
      <div class="col-12 col-sm-4 d-flex align-items-center justify-content-sm-end mt-3 mt-sm-0">
        <d-button theme="white" class="mr-2" @click="exportFlow">Export</d-button>
        <d-button theme="primary" @click="saveFlow">Save</d-button>
      </div>
    </div>

    <d-alert :theme="alertTheme" :show="timeUntilDismissed" dismissible @alert-dismissed="timeUntilDismissed = 0"
      @alert-dismiss-countdown="handleTimeChange">{{ alertText }}</d-alert>

    <!-- LogicFlow Container -->
    <div class="card card-small h-100 position-relative mb-4">
      <div class="card-body p-0">
        <!-- LogicFlow Canvas -->
        <div id="container" class="logic-flow-view" @drop="drop" @dragover.prevent></div>
      </div>
    </div>

    <!-- Node Property Modal -->
    <d-modal v-if="showNodeModal" @close="closeNodeModal" centered>
      <d-modal-header>
        <d-modal-title>{{ modalTitle }}</d-modal-title>
      </d-modal-header>
      <d-modal-body>
        <d-form @submit.prevent="updateNode">
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
                <d-input type="number"
                  v-model.number="nodeForm.properties.recommend.data_source.positive_feedback_ttl" />
              </div>
              <div class="form-group col-md-6">
                <label>Item TTL</label>
                <d-input type="number" v-model.number="nodeForm.properties.recommend.data_source.item_ttl" />
              </div>
            </div>
          </template>

          <!-- Recommend Global Properties -->
          <template v-if="nodeForm.properties.recommend && nodeForm.properties.recommend.cache_size !== undefined">
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Cache Size</label>
                <d-input type="number" v-model.number="nodeForm.properties.recommend.cache_size" />
              </div>
              <div class="form-group col-md-6">
                <label>Cache Expire</label>
                <d-input v-model="nodeForm.properties.recommend.cache_expire" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Active User TTL</label>
                <d-input type="number" v-model.number="nodeForm.properties.recommend.active_user_ttl" />
              </div>
              <div class="form-group col-md-6">
                <label>Context Size</label>
                <d-input type="number" v-model.number="nodeForm.properties.recommend.context_size" />
              </div>
            </div>
          </template>

          <!-- Ranker Specific Properties -->
          <template v-if="nodeForm.properties.recommend && nodeForm.properties.recommend.ranker">
            <div class="form-group">
              <label>Type</label>
              <d-select v-model="nodeForm.properties.recommend.ranker.type">
                <option value="none">None</option>
                <option value="fm">FM</option>
              </d-select>
            </div>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Fit Period</label>
                <d-input v-model="nodeForm.properties.recommend.ranker.fit_period" />
              </div>
              <div class="form-group col-md-6">
                <label>Fit Epoch</label>
                <d-input type="number" v-model.number="nodeForm.properties.recommend.ranker.fit_epoch" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Optimize Period</label>
                <d-input v-model="nodeForm.properties.recommend.ranker.optimize_period" />
              </div>
              <div class="form-group col-md-6">
                <label>Optimize Trials</label>
                <d-input type="number" v-model.number="nodeForm.properties.recommend.ranker.optimize_trials" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Cache Expire</label>
                <d-input v-model="nodeForm.properties.recommend.ranker.cache_expire" />
              </div>
              <div class="form-group col-md-6">
                <label>Early Stopping Patience</label>
                <d-input type="number"
                  v-model.number="nodeForm.properties.recommend.ranker.early_stopping.patience" />
              </div>
            </div>
          </template>

          <!-- Collaborative Specific Properties -->
          <template v-if="nodeForm.properties.recommend && nodeForm.properties.recommend.collaborative">
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
              <d-input type="number"
                v-model.number="nodeForm.properties.recommend.collaborative.early_stopping.patience" />
            </div>
          </template>

          <!-- Non-Personalized Specific Properties -->
          <template v-if="nodeForm.properties.recommend && nodeForm.properties.recommend.non_personalized && nodeForm.properties.recommend.non_personalized.length > 0">
            <div class="form-group">
              <label>Name</label>
              <d-input v-model="nodeForm.properties.recommend.non_personalized[0].name" />
            </div>
            <div class="form-group">
              <label>Score Formula</label>
              <d-input v-model="nodeForm.properties.recommend.non_personalized[0].score" />
            </div>
            <div class="form-group">
              <label>Filter Expression</label>
              <d-input v-model="nodeForm.properties.recommend.non_personalized[0].filter" />
            </div>
          </template>

          <!-- User to User Specific Properties -->
          <template v-if="nodeForm.properties.recommend && nodeForm.properties.recommend.user_to_user && nodeForm.properties.recommend.user_to_user.length > 0">
            <h6 class="border-bottom pb-2 mb-3">User to User Settings</h6>
            <div class="form-group">
              <label>Name</label>
              <d-input v-model="nodeForm.properties.recommend.user_to_user[0].name" />
            </div>
            <div class="form-group">
              <label>Type</label>
              <d-select v-model="nodeForm.properties.recommend.user_to_user[0].type">
                <option value="embedding">Embedding</option>
                <option value="tags">Tags</option>
                <option value="items">Items</option>
              </d-select>
            </div>
          </template>

          <!-- Item to Item Specific Properties -->
          <template v-if="nodeForm.properties.recommend && nodeForm.properties.recommend.item_to_item && nodeForm.properties.recommend.item_to_item.length > 0">
            <h6 class="border-bottom pb-2 mb-3">Item to Item Settings</h6>
            <div class="form-group">
              <label>Name</label>
              <d-input v-model="nodeForm.properties.recommend.item_to_item[0].name" />
            </div>
            <div class="form-group">
              <label>Type</label>
              <d-select v-model="nodeForm.properties.recommend.item_to_item[0].type">
                <option value="embedding">Embedding</option>
                <option value="tags">Tags</option>
                <option value="users">Users</option>
                <option value="chat">Chat</option>
              </d-select>
            </div>
            <div class="form-group" v-if="nodeForm.properties.recommend.item_to_item[0].type === 'embedding'">
              <label>Column</label>
              <d-input v-model="nodeForm.properties.recommend.item_to_item[0].column" />
            </div>
          </template>

          <div class="text-right pt-3">
            <d-button type="button" theme="secondary" class="mr-2" @click="closeNodeModal">Cancel</d-button>
            <d-button type="submit" theme="primary">Save</d-button>
          </div>
        </d-form>
      </d-modal-body>
    </d-modal>

    <!-- Export Modal -->
    <d-modal v-if="showExportModal" @close="showExportModal = false" centered>
      <d-modal-header>
        <d-modal-title>Export TOML</d-modal-title>
      </d-modal-header>
      <d-modal-body>
        <textarea v-model="exportData" rows="15" class="form-control w-100" style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif; font-size: 0.85rem;"></textarea>
        <div class="mt-3 text-right">
          <d-button class="mr-2" theme="white" @click="copyExportData">Copy</d-button>
          <d-button theme="primary" @click="showExportModal = false">Close</d-button>
        </div>
      </d-modal-body>
    </d-modal>
  </div>
</template>

<script>
import LogicFlow, { HtmlNode, HtmlNodeModel, BezierEdge, BezierEdgeModel } from '@logicflow/core';
import '@logicflow/core/dist/index.css';
import dagre from 'dagre';
import axios from 'axios';

class DashedEdgeModel extends BezierEdgeModel {
  getEdgeStyle() {
    const style = super.getEdgeStyle();
    style.strokeDasharray = '5,5';
    style.stroke = '#007bff';
    return style;
  }
}

class IconNodeModel extends HtmlNodeModel {
  setAttributes() {
    this.width = 270;
    const { properties, text } = this;
    const nodeText = typeof text === 'object' ? text.value : text;
    const rec = properties && properties.recommend;

    if (rec) {
      if (rec.data_source) {
        this.width = 150;
      } else if (nodeText === 'Recommend' || rec.cache_size !== undefined) {
        this.width = 160;
      } else if (rec.ranker || rec.fallback || nodeText === 'Ranker' || nodeText === 'Fallback') {
        this.width = 120;
      }
    } else if (nodeText === 'Recommend') {
      this.width = 160;
    } else if (nodeText === 'Ranker' || nodeText === 'Fallback') {
      this.width = 120;
    }

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
    const { text, properties } = this.props.model;
    const el = document.createElement('div');
    el.className = 'card';

    // Determine icon based on properties or text fallback
    let iconName = 'settings'; // Default icon
    let nodeText = '';
    if (text) {
      nodeText = typeof text === 'object' ? text.value : text;
    }

    const rec = properties && properties.recommend;
    if (rec) {
      if (rec.data_source) iconName = 'database';
      else if (rec.user_to_user && rec.user_to_user.length > 0) iconName = 'people';
      else if (rec.item_to_item && rec.item_to_item.length > 0) iconName = 'apps';
      else if (rec.non_personalized && rec.non_personalized.length > 0) iconName = 'public';
      else if (rec.collaborative) iconName = 'group_work';
      else if (rec.ranker) iconName = 'sort';
      else if (rec.fallback) iconName = 'history';
    }

    // Fallback for nodes without structured properties (like Latest, Start, End)
    // Also covers the initial drag-and-drop state where properties might be simpler
    if (iconName === 'settings') {
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
      else if (nodeText.toLowerCase().includes('fallback')) iconName = 'history';
    }

    let width = 270;
    if (iconName === 'database') {
      width = 150;
    } else if (nodeText === 'Recommend') {
      width = 160;
    } else if (iconName === 'sort' || iconName === 'history') {
      width = 120;
    }

    const html = `
      <div class="card-body d-flex align-items-center p-2 shadow-sm rounded border bg-white" style="height: 50px; width: ${width}px; border-color: #007bff !important;">
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
      showExportModal: false,
      exportData: '',
      alertTheme: 'danger',
      alertText: null,
      duration: 5,
      timeUntilDismissed: 0,
      nodeForm: {
        id: '',
        text: '',
        properties: {},
      },
      config: null,
    };
  },
  computed: {
    modalTitle() {
      if (this.nodeForm.properties && this.nodeForm.properties.recommend) {
        if (this.nodeForm.properties.recommend.data_source) {
          return 'Edit Data Source';
        }
        if (this.nodeForm.properties.recommend.cache_size !== undefined) {
          return 'Edit Recommend';
        }
        if (this.nodeForm.properties.recommend.ranker) {
          return 'Edit Ranker';
        }
        if (this.nodeForm.properties.recommend.collaborative) {
          return 'Edit Collaborative';
        }
        if (this.nodeForm.properties.recommend.non_personalized) {
          return 'Edit Non-Personalized';
        }
        if (this.nodeForm.properties.recommend.user_to_user) {
          return 'Edit User to User';
        }
        if (this.nodeForm.properties.recommend.item_to_item) {
          return 'Edit Item to Item';
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
      style: {
        bezier: {
          strokeWidth: 1,
          stroke: '#007bff',
        },
      },
    });

    this.lf.register({
      type: 'icon-node',
      view: IconNode,
      model: IconNodeModel,
    });

    this.lf.register({
      type: 'dashed-edge',
      view: BezierEdge,
      model: DashedEdgeModel,
    });

    // Event Listeners
    this.lf.on('node:dbclick', this.handleNodeDbClick);

    axios.get('/api/dashboard/config').then((response) => {
      this.config = response.data;
      this.initGraph();
    }).catch((error) => {
      console.error(error);
    });
  },
  methods: {
    handleTimeChange(time) {
      this.timeUntilDismissed = time;
    },
    showDanger(message) {
      this.timeUntilDismissed = this.duration;
      this.alertTheme = 'danger';
      this.alertText = message;
    },
    showSuccess(message) {
      this.timeUntilDismissed = this.duration;
      this.alertTheme = 'success';
      this.alertText = message;
    },
    initGraph() {
      const { nodes, edges } = this.generateGraphData();
      const layoutedData = this.layout(nodes, edges);

      // 渲染数据
      this.lf.render(layoutedData);

      // 居中显示
      this.lf.translateCenter();
    },
    generateGraphData() {
      const { recommend } = this.config;
      const nodes = [];
      const edges = [];

      // 1. Fixed Nodes
      nodes.push({
        id: 'data-source',
        type: 'icon-node',
        text: 'Data Source',
        properties: {
          fixedName: true,
          recommend: {
            data_source: recommend.data_source,
          },
        },
      });

      nodes.push({
        id: 'ranker',
        type: 'icon-node',
        text: 'Ranker',
        properties: {
          recommend: {
            ranker: recommend.ranker,
          },
        },
      });

      nodes.push({
        id: 'fallback',
        type: 'icon-node',
        text: 'Fallback',
        properties: {
          recommend: {
            fallback: recommend.fallback,
          },
        },
      });

      nodes.push({
        id: 'recommend',
        type: 'icon-node',
        text: 'Recommend',
        properties: {
          fixedName: true,
          recommend: {
            cache_size: recommend.cache_size,
            cache_expire: recommend.cache_expire,
            active_user_ttl: recommend.active_user_ttl,
            context_size: recommend.context_size,
            replacement: recommend.replacement,
          },
        },
      });

      // Ranker -> Recommend
      edges.push({ sourceNodeId: 'ranker', targetNodeId: 'recommend', type: 'bezier' });
      // Fallback -> Recommend
      edges.push({ sourceNodeId: 'fallback', targetNodeId: 'recommend', type: 'bezier' });

      // 2. Candidate Source Nodes
      const sourceNodeMap = {};

      // Latest
      const latestNode = {
        id: 'latest',
        type: 'icon-node',
        text: 'Latest',
        properties: { readOnly: true },
      };
      nodes.push(latestNode);
      sourceNodeMap.latest = latestNode.id;
      edges.push({ sourceNodeId: 'data-source', targetNodeId: latestNode.id, type: 'bezier' });

      // Collaborative
      if (recommend.collaborative) {
        const collabNode = {
          id: 'collaborative',
          type: 'icon-node',
          text: 'Collaborative',
          properties: {
            fixedName: true,
            recommend: {
              collaborative: recommend.collaborative,
            },
          },
        };
        nodes.push(collabNode);
        sourceNodeMap.collaborative = collabNode.id;
        edges.push({ sourceNodeId: 'data-source', targetNodeId: collabNode.id, type: 'bezier' });
      }

      // Non-Personalized
      if (recommend['non-personalized']) {
        recommend['non-personalized'].forEach((item) => {
          const id = `non-personalized-${item.name}`;
          const node = {
            id,
            type: 'icon-node',
            text: item.name,
            properties: {
              recommend: {
                non_personalized: [item],
              },
            },
          };
          nodes.push(node);
          sourceNodeMap[`non-personalized/${item.name}`] = id;
          edges.push({ sourceNodeId: 'data-source', targetNodeId: id, type: 'bezier' });
        });
      }

      // User to User
      if (recommend['user-to-user']) {
        recommend['user-to-user'].forEach((item) => {
          const id = `user-to-user-${item.name}`;
          const node = {
            id,
            type: 'icon-node',
            text: item.name,
            properties: {
              recommend: {
                user_to_user: [item],
              },
            },
          };
          nodes.push(node);
          sourceNodeMap[`user-to-user/${item.name}`] = id;
          edges.push({ sourceNodeId: 'data-source', targetNodeId: id, type: 'bezier' });
        });
      }

      // Item to Item
      if (recommend['item-to-item']) {
        recommend['item-to-item'].forEach((item) => {
          const id = `item-to-item-${item.name}`;
          const node = {
            id,
            type: 'icon-node',
            text: item.name,
            properties: {
              recommend: {
                item_to_item: [item],
              },
            },
          };
          nodes.push(node);
          sourceNodeMap[`item-to-item/${item.name}`] = id;
          edges.push({ sourceNodeId: 'data-source', targetNodeId: id, type: 'bezier' });
        });
      }

      // 3. Connect Sources to Ranker
      const rankerRecommenders = recommend.ranker.recommenders || [];
      rankerRecommenders.forEach((rec) => {
        const nodeId = sourceNodeMap[rec];
        if (nodeId) {
          const exists = edges.some(e => e.sourceNodeId === nodeId && e.targetNodeId === 'ranker');
          if (!exists) {
            edges.push({ sourceNodeId: nodeId, targetNodeId: 'ranker', type: 'bezier' });
          }
        }
      });

      // 4. Connect Sources to Fallback
      const fallbackRecommenders = recommend.fallback.recommenders || [];
      fallbackRecommenders.forEach((rec) => {
        const nodeId = sourceNodeMap[rec];
        if (nodeId) {
          const exists = edges.some(e => e.sourceNodeId === nodeId && e.targetNodeId === 'fallback');
          if (!exists) {
            edges.push({ sourceNodeId: nodeId, targetNodeId: 'fallback', type: 'dashed-edge' });
          }
        }
      });

      return { nodes, edges };
    },
    layout(nodes, edges) {
      const g = new dagre.graphlib.Graph();
      g.setGraph({ rankdir: 'LR', nodesep: 20, ranksep: 100 });
      g.setDefaultEdgeLabel(() => ({}));

      nodes.forEach((node) => {
        let width = 270;
        const rec = node.properties && node.properties.recommend;
        if (node.text === 'Data Source' || (rec && rec.data_source)) {
          width = 150;
        } else if (node.text === 'Recommend' || (rec && rec.cache_size !== undefined)) {
          width = 160;
        } else if (node.text === 'Ranker' || node.text === 'Fallback' || (rec && (rec.ranker || rec.fallback))) {
          width = 120;
        }
        g.setNode(node.id, { width, height: 60 });
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
      let text = '';
      if (data.text) {
        text = typeof data.text === 'object' ? data.text.value : data.text;
      }
      this.nodeForm = JSON.parse(JSON.stringify({
        id: data.id,
        text,
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
    exportFlow() {
      this.syncGraphToConfig();
      this.exportData = this.jsonToToml({ recommend: this.config.recommend });
      this.showExportModal = true;
    },
    syncGraphToConfig() {
      const data = this.lf.getGraphData();
      const newRecommend = {
        ...this.config.recommend,
        data_source: {},
        collaborative: null,
        'non-personalized': [],
        'user-to-user': [],
        'item-to-item': [],
        ranker: {
          ...this.config.recommend.ranker,
          recommenders: [],
        },
        fallback: {
          ...this.config.recommend.fallback,
          recommenders: [],
        },
      };

      // 1. Process Nodes
      data.nodes.forEach((node) => {
        const props = node.properties;
        if (!props || !props.recommend) return;

        if (props.recommend.data_source) {
          newRecommend.data_source = props.recommend.data_source;
        }
        if (props.recommend.collaborative) {
          newRecommend.collaborative = props.recommend.collaborative;
        }
        if (props.recommend.non_personalized) {
          newRecommend['non-personalized'].push(...props.recommend.non_personalized);
        }
        if (props.recommend.user_to_user) {
          newRecommend['user-to-user'].push(...props.recommend.user_to_user);
        }
        if (props.recommend.item_to_item) {
          newRecommend['item-to-item'].push(...props.recommend.item_to_item);
        }
        // Handle global properties from 'recommend' node
        if (node.text && typeof node.text === 'string' && node.text.toLowerCase() === 'recommend') {
          if (props.recommend.cache_size !== undefined) newRecommend.cache_size = props.recommend.cache_size;
          if (props.recommend.cache_expire !== undefined) newRecommend.cache_expire = props.recommend.cache_expire;
          if (props.recommend.active_user_ttl !== undefined) newRecommend.active_user_ttl = props.recommend.active_user_ttl;
          if (props.recommend.context_size !== undefined) newRecommend.context_size = props.recommend.context_size;
          if (props.recommend.replacement) newRecommend.replacement = props.recommend.replacement;
          if (props.recommend.external) newRecommend.external = props.recommend.external;
        }
        // Handle Ranker/Fallback properties
        if (props.recommend.ranker) {
          Object.assign(newRecommend.ranker, props.recommend.ranker);
          // Clear recommenders to be rebuilt from edges, unless we want to keep properties' ones?
          // The edge traversal below will populate valid connections.
          newRecommend.ranker.recommenders = [];
        }
        if (props.recommend.fallback) {
          Object.assign(newRecommend.fallback, props.recommend.fallback);
          newRecommend.fallback.recommenders = [];
        }
      });

      // 2. Process Edges for Ranker/Fallback
      // Map node IDs to their types/content
      const nodeMap = {};
      data.nodes.forEach((node) => {
        nodeMap[node.id] = node;
      });

      data.edges.forEach((edge) => {
        const targetNode = nodeMap[edge.targetNodeId];
        const sourceNode = nodeMap[edge.sourceNodeId];
        if (!targetNode || !sourceNode) return;

        let targetType = '';
        if (targetNode.text === 'Ranker' || (targetNode.properties && targetNode.properties.recommend && targetNode.properties.recommend.ranker)) {
          targetType = 'ranker';
        } else if (targetNode.text === 'Fallback' || (targetNode.properties && targetNode.properties.recommend && targetNode.properties.recommend.fallback)) {
          targetType = 'fallback';
        }

        if (targetType) {
          const recommenders = [];
          // Determine source recommender names
          if (sourceNode.text === 'Latest') {
            recommenders.push('latest');
          } else if (sourceNode.text === 'Collaborative') {
            recommenders.push('collaborative');
          } else {
            const p = sourceNode.properties && sourceNode.properties.recommend;
            if (p) {
              if (p.non_personalized) {
                p.non_personalized.forEach(i => recommenders.push(`non-personalized/${i.name}`));
              }
              if (p.user_to_user) {
                p.user_to_user.forEach(i => recommenders.push(`user-to-user/${i.name}`));
              }
              if (p.item_to_item) {
                p.item_to_item.forEach(i => recommenders.push(`item-to-item/${i.name}`));
              }
            }
          }

          if (targetType === 'ranker') {
            newRecommend.ranker.recommenders.push(...recommenders);
          } else {
            newRecommend.fallback.recommenders.push(...recommenders);
          }
        }
      });

      // Unique recommenders
      newRecommend.ranker.recommenders = [...new Set(newRecommend.ranker.recommenders)];
      newRecommend.fallback.recommenders = [...new Set(newRecommend.fallback.recommenders)];

      // Update config
      this.config.recommend = newRecommend;
    },
    jsonToToml(obj) {
      let output = '';

      const isPrimitive = v => v !== Object(v);
      const isArray = v => Array.isArray(v);
      const isObject = v => v !== null && typeof v === 'object' && !isArray(v);

      // Helper to format primitives
      const formatValue = (v) => {
        if (typeof v === 'string') {
          if (v.includes('\n')) {
            return `"""\n${v}"""`;
          }
          // Escape quotes and backslashes
          return `"${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
        }
        return v;
      };

      // 1. Top Level Primitives
      Object.entries(obj).forEach(([k, v]) => {
        if (isPrimitive(v) || (isArray(v) && (v.length === 0 || isPrimitive(v[0])))) {
          if (isArray(v)) {
            output += `${k} = [${v.map(formatValue).join(', ')}]\n`;
          } else {
            output += `${k} = ${formatValue(v)}\n`;
          }
        }
      });

      // 2. Sections (Objects)
      Object.entries(obj).forEach(([k, v]) => {
        if (isObject(v)) {
          output += `\n[${k}]\n`;
          // Print properties of this section
          Object.entries(v).forEach(([sk, sv]) => {
            // Check if sub-value is primitive or array of primitives
            if (isPrimitive(sv) || (isArray(sv) && (sv.length === 0 || isPrimitive(sv[0])))) {
              if (isArray(sv)) {
                output += `${sk} = [${sv.map(formatValue).join(', ')}]\n`;
              } else {
                output += `${sk} = ${formatValue(sv)}\n`;
              }
            }
          });

          // Handle nested objects (using dotted keys or subsections)
          Object.entries(v).forEach(([sk, sv]) => {
            if (isObject(sv)) {
              output += `\n[${k}.${sk}]\n`;
              Object.entries(sv).forEach(([ssk, ssv]) => {
                if (isPrimitive(ssv)) {
                  output += `${ssk} = ${formatValue(ssv)}\n`;
                } else if (isArray(ssv) && (ssv.length === 0 || isPrimitive(ssv[0]))) {
                  output += `${ssk} = [${ssv.map(formatValue).join(', ')}]\n`;
                }
              });
            } else if (isArray(sv) && sv.length > 0 && isObject(sv[0])) {
              // Array of Tables (e.g. [[recommend.external]])
              sv.forEach((item) => {
                output += `\n[[${k}.${sk}]]\n`;
                Object.entries(item).forEach(([ik, iv]) => {
                  if (isPrimitive(iv)) {
                    output += `${ik} = ${formatValue(iv)}\n`;
                  } else if (isArray(iv)) {
                    output += `${ik} = [${iv.map(formatValue).join(', ')}]\n`;
                  }
                });
              });
            }
          });
        }
      });
      return output.trim();
    },
    copyExportData() {
      const textarea = document.createElement('textarea');
      textarea.value = this.exportData;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      // eslint-disable-next-line no-alert
      alert('Copied to clipboard');
    },
    saveFlow() {
      this.syncGraphToConfig();
      axios.post('/api/dashboard/config', this.config)
        .then(() => {
          this.showSuccess('Configuration saved successfully!');
        })
        .catch((error) => {
          this.showDanger(`Failed to save configuration: ${error.message}`);
        });
    },
    dragStart(e, type) {
      e.dataTransfer.setData('type', type);
    },
    drop(e) {
      e.preventDefault();
      const type = e.dataTransfer.getData('type');
      if (type) {
        const { x, y } = this.lf.getPointByClient(e.clientX, e.clientY);
        const newNode = {
          type: 'icon-node',
          x,
          y,
          text: type,
          properties: {},
        };

        if (type === 'Latest') {
          newNode.properties = { readOnly: true };
        } else if (type === 'Collaborative') {
          newNode.properties = {
            recommend: {
              collaborative: {
                fit_period: '60m',
                fit_epoch: 10,
                optimize_period: '60m',
                optimize_trials: 10,
                early_stopping: {
                  patience: 10,
                },
              },
            },
          };
        } else if (type === 'NonPersonalized') {
          newNode.properties = {
            recommend: {
              non_personalized: [
                {
                  name: 'new_non_personalized',
                  score: '',
                  filter: '',
                },
              ],
            },
          };
        } else if (type === 'User to User') {
          newNode.properties = {
            recommend: {
              user_to_user: [
                {
                  name: 'neighbors',
                  type: 'items',
                },
              ],
            },
          };
        } else if (type === 'Item to Item') {
          newNode.properties = {
            recommend: {
              item_to_item: [
                {
                  name: 'neighbors',
                  type: 'embedding',
                  column: 'item.Labels.embedding',
                },
              ],
            },
          };
        }

        // Generate a random ID
        newNode.id = Math.random().toString(36).substr(2, 9);
        this.lf.addNode(newNode);
      }
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
