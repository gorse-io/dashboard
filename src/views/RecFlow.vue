<template>
  <div class="main-content-container container-fluid px-4">
    <!-- Page Header -->
    <div class="page-header row no-gutters py-4">
      <div class="col-12 col-sm-8 text-center text-sm-left mb-0 d-flex align-items-center">
        <div class="d-flex align-items-center p-2 mr-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'latest')">
          <i class="material-icons mr-2 text-primary">new_releases</i>
          <span>Latest</span>
        </div>
        <div class="d-flex align-items-center p-2 mr-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'collaborative')">
          <i class="material-icons mr-2 text-primary">group_work</i>
          <span>Collaborative</span>
        </div>
        <div class="d-flex align-items-center p-2 mr-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'non-personalized')">
          <i class="material-icons mr-2 text-primary">public</i>
          <span>Non-Personalized</span>
        </div>
        <div class="d-flex align-items-center p-2 mr-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'user-to-user')">
          <i class="material-icons mr-2 text-primary">people</i>
          <span>User to User</span>
        </div>
        <div class="d-flex align-items-center p-2 mr-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'item-to-item')">
          <i class="material-icons mr-2 text-primary">apps</i>
          <span>Item to Item</span>
        </div>
        <div class="d-flex align-items-center p-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'external')">
          <i class="material-icons mr-2 text-primary">cloud_queue</i>
          <span>External</span>
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
    <d-modal v-if="showNodeModal" @close="closeNodeModal" centered :size="nodeForm.type === 'external' ? 'lg' : null">
      <d-modal-header>
        <d-modal-title>{{ modalTitle }}</d-modal-title>
      </d-modal-header>
      <d-modal-body>
        <d-form @submit.prevent="updateNode">
          <!-- Data Source Specific Properties -->
          <template v-if="nodeForm.type === 'data-source'">
            <div class="form-group">
              <label>Positive Feedback Types (comma separated)</label>
              <d-input :value="nodeForm.properties.positive_feedback_types.join(',')"
                @input="val => nodeForm.properties.positive_feedback_types = val.split(',').map(s => s.trim())" />
            </div>
            <div class="form-group">
              <label>Read Feedback Types (comma separated)</label>
              <d-input :value="nodeForm.properties.read_feedback_types.join(',')"
                @input="val => nodeForm.properties.read_feedback_types = val.split(',').map(s => s.trim())" />
            </div>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Positive Feedback TTL</label>
                <d-input type="number" v-model.number="nodeForm.properties.positive_feedback_ttl" />
              </div>
              <div class="form-group col-md-6">
                <label>Item TTL</label>
                <d-input type="number" v-model.number="nodeForm.properties.item_ttl" />
              </div>
            </div>
          </template>

          <!-- Fallback Specific Properties -->
          <template v-if="nodeForm.type === 'fallback'">
            <div class="form-group">
              <label>Recommenders</label>
              <d-list-group>
                <d-list-group-item v-for="(rec, index) in nodeForm.properties.recommenders" :key="rec"
                  class="d-flex align-items-center border">
                  <span class="mr-auto">{{ rec }}</span>
                  <d-input-group-addon append>
                    <d-button class="btn-white" @click="moveRecommender(index, -1)" :disabled="index === 0">
                      <i class="material-icons">arrow_upward</i>
                    </d-button>
                    <d-button class="btn-white" @click="moveRecommender(index, 1)"
                      :disabled="index === nodeForm.properties.recommenders.length - 1">
                      <i class="material-icons">arrow_downward</i>
                    </d-button>
                  </d-input-group-addon>
                </d-list-group-item>
              </d-list-group>
              <div v-if="!nodeForm.properties.recommenders || nodeForm.properties.recommenders.length === 0"
                class="text-muted font-italic">
                No connected recommenders.
              </div>
            </div>
          </template>

          <!-- Recommend Global Properties -->
          <template v-if="nodeForm.type === 'recommend'">
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Cache Size</label>
                <d-input type="number" v-model.number="nodeForm.properties.cache_size" />
              </div>
              <div class="form-group col-md-6">
                <label>Cache Expire</label>
                <d-input v-model="nodeForm.properties.cache_expire" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Active User TTL</label>
                <d-input type="number" v-model.number="nodeForm.properties.active_user_ttl" />
              </div>
              <div class="form-group col-md-6">
                <label>Context Size</label>
                <d-input type="number" v-model.number="nodeForm.properties.context_size" />
              </div>
            </div>
          </template>

          <!-- Ranker Specific Properties -->
          <template v-if="nodeForm.type === 'ranker'">
            <div class="form-group">
              <label>Type</label>
              <d-select v-model="nodeForm.properties.type">
                <option value="fm">FM</option>
              </d-select>
            </div>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Fit Period</label>
                <d-input v-model="nodeForm.properties.fit_period" />
              </div>
              <div class="form-group col-md-6">
                <label>Fit Epoch</label>
                <d-input type="number" v-model.number="nodeForm.properties.fit_epoch" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Optimize Period</label>
                <d-input v-model="nodeForm.properties.optimize_period" />
              </div>
              <div class="form-group col-md-6">
                <label>Optimize Trials</label>
                <d-input type="number" v-model.number="nodeForm.properties.optimize_trials" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Cache Expire</label>
                <d-input v-model="nodeForm.properties.cache_expire" />
              </div>
              <div class="form-group col-md-6">
                <label>Early Stopping Patience</label>
                <d-input type="number" v-model.number="nodeForm.properties.early_stopping.patience" />
              </div>
            </div>
          </template>

          <!-- Collaborative Specific Properties -->
          <template v-if="nodeForm.type === 'collaborative'">
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Fit Period</label>
                <d-input v-model="nodeForm.properties.fit_period" />
              </div>
              <div class="form-group col-md-6">
                <label>Fit Epoch</label>
                <d-input type="number" v-model.number="nodeForm.properties.fit_epoch" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group col-md-6">
                <label>Optimize Period</label>
                <d-input v-model="nodeForm.properties.optimize_period" />
              </div>
              <div class="form-group col-md-6">
                <label>Optimize Trials</label>
                <d-input type="number" v-model.number="nodeForm.properties.optimize_trials" />
              </div>
            </div>
            <div class="form-group">
              <label>Early Stopping Patience</label>
              <d-input type="number" v-model.number="nodeForm.properties.early_stopping.patience" />
            </div>
          </template>

          <!-- Non-Personalized Specific Properties -->
          <template v-if="nodeForm.type === 'non-personalized'">
            <div class="form-group">
              <label>Name</label>
              <d-input v-model="nodeForm.properties.name" @input="syncNodeName" />
            </div>
            <div class="form-group">
              <label>Score Formula</label>
              <d-input v-model="nodeForm.properties.score" />
            </div>
            <div class="form-group">
              <label>Filter Expression</label>
              <d-input v-model="nodeForm.properties.filter" />
            </div>
          </template>

          <!-- User to User Specific Properties -->
          <template v-if="nodeForm.type === 'user-to-user'">
            <div class="form-group">
              <label>Name</label>
              <d-input v-model="nodeForm.properties.name" @input="syncNodeName" />
            </div>
            <div class="form-group">
              <label>Type</label>
              <d-select v-model="nodeForm.properties.type">
                <option value="embedding">Embedding</option>
                <option value="tags">Tags</option>
                <option value="items">Items</option>
              </d-select>
            </div>
            <div class="form-group"
              v-if="nodeForm.properties.type === 'embedding' || nodeForm.properties.type === 'tags'">
              <label>Column</label>
              <d-input v-model="nodeForm.properties.column" />
            </div>
          </template>

          <!-- Item to Item Specific Properties -->
          <template v-if="nodeForm.type === 'item-to-item'">
            <div class="form-group">
              <label>Name</label>
              <d-input v-model="nodeForm.properties.name" @input="syncNodeName" />
            </div>
            <div class="form-group">
              <label>Type</label>
              <d-select v-model="nodeForm.properties.type">
                <option value="embedding">Embedding</option>
                <option value="tags">Tags</option>
                <option value="users">Users</option>
              </d-select>
            </div>
            <div class="form-group"
              v-if="nodeForm.properties.type === 'embedding' || nodeForm.properties.type === 'tags'">
              <label>Column</label>
              <d-input v-model="nodeForm.properties.column" />
            </div>
          </template>

          <!-- External Recommender Properties -->
          <template v-if="nodeForm.type === 'external'">
            <div class="form-group">
              <label>Name</label>
              <d-input v-model="nodeForm.properties.name" @input="syncNodeName" />
            </div>
            <div class="form-group">
              <label>Script <a href="https://gorse.io/docs/concepts/recommenders/external.html" target="_blank" class="ml-1"><i class="material-icons">help_outline</i></a></label>
              <div ref="monacoEditor" class="monaco-container"></div>
              <small class="text-muted" v-if="monacoError">{{ monacoError }}</small>
            </div>
            <div class="form-group">
              <d-input-group>
                <d-input placeholder="User ID" v-model="previewUserId" />
                <d-input-group-addon append>
                  <d-button type="button" theme="primary" @click="runExternalScript" :disabled="previewLoading">
                    <i class="material-icons">play_arrow</i>
                  </d-button>
                </d-input-group-addon>
              </d-input-group>
            </div>
            <div class="form-group" v-if="previewResult || previewError">
              <label>Result</label>
              <pre class="bg-light p-2 rounded border" v-if="!previewError"
                style="max-height: 200px; overflow: auto;">{{ previewResult }}</pre>
              <d-alert theme="danger" show v-else>{{ previewError }}</d-alert>
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
        <textarea v-model="exportData" rows="15" class="form-control w-100"
          style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif; font-size: 0.85rem;"></textarea>
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
    const { properties, text, type } = this;
    const nodeText = typeof text === 'object' ? text.value : text;

    if (type === 'data-source') {
      this.width = 150;
    } else if (type === 'recommend') {
      this.width = 160;
    } else if (type === 'ranker' || type === 'fallback') {
      this.width = 120;
    }

    this.height = 50;
    this.text.editable = false;

    // Prevent deletion of essential nodes
    if (['data-source', 'recommend', 'ranker', 'fallback'].includes(type)) {
      this.deletable = false;
    }
  }

  getTextStyle() {
    const style = super.getTextStyle();
    style.display = 'none';
    return style;
  }
}

class IconNode extends HtmlNode {
  setHtml(rootEl) {
    rootEl.innerHTML = '';
    const { text, properties, type } = this.props.model;
    const el = document.createElement('div');
    el.className = 'card';

    // Determine icon based on type
    let iconName = 'settings'; // Default icon
    let nodeText = '';
    if (properties && properties.name) {
      nodeText = properties.name;
    } else if (text) {
      nodeText = typeof text === 'object' ? text.value : text;
    }

    if (type === 'data-source') iconName = 'database';
    else if (type === 'user-to-user') iconName = 'people';
    else if (type === 'item-to-item') iconName = 'apps';
    else if (type === 'non-personalized') iconName = 'public';
    else if (type === 'collaborative') iconName = 'group_work';
    else if (type === 'ranker') iconName = 'sort';
    else if (type === 'fallback') iconName = 'history';
    else if (type === 'latest') iconName = 'new_releases';
    else if (type === 'external') iconName = 'cloud_queue';

    let width = 270;
    if (type === 'data-source') {
      width = 150;
    } else if (type === 'recommend') {
      width = 160;
    } else if (type === 'ranker' || type === 'fallback') {
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
        type: '',
        text: '',
        properties: {},
      },
      config: null,
      monaco: null,
      monacoEditor: null,
      monacoError: '',
      previewUserId: '',
      previewResult: null,
      previewError: null,
      previewLoading: false,
    };
  },
  computed: {
    modalTitle() {
      switch (this.nodeForm.type) {
        case 'data-source':
          return 'Edit Data Source';
        case 'recommend':
          return 'Edit Recommend';
        case 'ranker':
          return 'Edit Ranker';
        case 'collaborative':
          return 'Edit Collaborative';
        case 'non-personalized':
          return 'Edit Non-Personalized';
        case 'user-to-user':
          return 'Edit User to User';
        case 'item-to-item':
          return 'Edit Item to Item';
        case 'external':
          return 'Edit External';
        case 'fallback':
          return 'Edit Fallback';
        default:
          return 'Edit Node';
      }
    },
  },
  watch: {
    showNodeModal(val) {
      if (val && this.nodeForm.type === 'external') {
        this.$nextTick(() => {
          this.initMonaco();
        });
      } else if (!val) {
        this.disposeMonaco();
      }
    },
  },
  mounted() {
    this.lf = new LogicFlow({
      container: document.querySelector('#container'),
      grid: true,
      nodeTextEdit: false,
      edgeTextEdit: false,
      edgeType: 'bezier',
      keyboard: {
        enabled: true,
      },
      style: {
        edge: {
          stroke: '#007bff',
          strokeWidth: 1,
        },
        bezier: {
          strokeWidth: 1,
          stroke: '#007bff',
        },
      },
    });

    this.lf.register({
      type: 'dashed-edge',
      view: BezierEdge,
      model: DashedEdgeModel,
    });

    const nodeTypes = [
      'data-source',
      'ranker',
      'fallback',
      'recommend',
      'latest',
      'collaborative',
      'non-personalized',
      'user-to-user',
      'item-to-item',
      'external',
      'icon-node', // Keep generic fallback
    ];

    nodeTypes.forEach((type) => {
      this.lf.register({
        type,
        view: IconNode,
        model: IconNodeModel,
      });
    });

    // Event Listeners
    this.lf.on('node:dbclick', this.handleNodeDbClick);

    this.lf.on('edge:add,connection:add,edge:exchange-node', ({ data }) => {
      if (data.targetNodeId === 'fallback' && data.type !== 'dashed-edge') {
        this.lf.changeEdgeType(data.id, 'dashed-edge');
      } else if (data.targetNodeId !== 'fallback' && data.type === 'dashed-edge') {
        this.lf.changeEdgeType(data.id, 'bezier');
      }
    });

    // Keyboard Shortcuts
    this.lf.keyboard.on(['backspace', 'delete'], () => {
      const { nodes, edges } = this.lf.getSelectElements(true);
      const deletedNodeIds = new Set();

      nodes.forEach((node) => {
        const nodeModel = this.lf.getNodeModelById(node.id);
        if (nodeModel && nodeModel.deletable !== false) {
          this.lf.deleteNode(node.id);
          deletedNodeIds.add(node.id);
        }
      });

      edges.forEach((edge) => {
        const sourceNodeModel = this.lf.getNodeModelById(edge.sourceNodeId);
        const targetNodeModel = this.lf.getNodeModelById(edge.targetNodeId);
        // Prevent deleting edges from Data Source unless the node itself is deleted
        if (sourceNodeModel && sourceNodeModel.type === 'data-source' && !deletedNodeIds.has(edge.sourceNodeId)) {
          return;
        }
        // Prevent deleting edges connected to Recommend node
        if (targetNodeModel && targetNodeModel.type === 'recommend') {
          return;
        }
        this.lf.deleteEdge(edge.id);
      });
    });

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
        type: 'data-source',
        text: 'Data Source',
        properties: {
          fixedName: true,
          ...recommend.data_source,
        },
      });

      nodes.push({
        id: 'ranker',
        type: 'ranker',
        text: 'Ranker',
        properties: {
          fixedName: true,
          ...recommend.ranker,
        },
      });

      nodes.push({
        id: 'fallback',
        type: 'fallback',
        text: 'Fallback',
        properties: {
          fixedName: true,
          ...recommend.fallback,
        },
      });

      nodes.push({
        id: 'recommend',
        type: 'recommend',
        text: 'Recommend',
        properties: {
          fixedName: true,
          cache_size: recommend.cache_size,
          cache_expire: recommend.cache_expire,
          active_user_ttl: recommend.active_user_ttl,
          context_size: recommend.context_size,
          replacement: recommend.replacement,
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
        type: 'latest',
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
          type: 'collaborative',
          text: 'Collaborative',
          properties: {
            fixedName: true,
            ...recommend.collaborative,
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
            type: 'non-personalized',
            text: item.name,
            properties: {
              ...item,
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
            type: 'user-to-user',
            text: item.name,
            properties: {
              ...item,
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
            type: 'item-to-item',
            text: item.name,
            properties: {
              ...item,
            },
          };
          nodes.push(node);
          sourceNodeMap[`item-to-item/${item.name}`] = id;
          edges.push({ sourceNodeId: 'data-source', targetNodeId: id, type: 'bezier' });
        });
      }

      // External
      if (recommend.external) {
        recommend.external.forEach((item) => {
          const id = `external-${item.name}`;
          const node = {
            id,
            type: 'external',
            text: item.name,
            properties: {
              ...item,
            },
          };
          nodes.push(node);
          sourceNodeMap[`external/${item.name}`] = id;
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
        if (node.type === 'data-source') {
          width = 150;
        } else if (node.type === 'recommend') {
          width = 160;
        } else if (node.type === 'ranker' || node.type === 'fallback') {
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
      this.originalText = text;

      const properties = data.properties || {};

      // For fallback nodes, populate recommenders list with order
      if (data.type === 'fallback') {
        const connectedRecommenders = this.getConnectedRecommenders(data.id);
        const existingRecommenders = properties.recommenders || [];

        // Merge: Keep existing order, add new ones at the end
        const merged = [...existingRecommenders.filter(r => connectedRecommenders.includes(r))];
        connectedRecommenders.forEach((r) => {
          if (!merged.includes(r)) {
            merged.push(r);
          }
        });
        properties.recommenders = merged;
      }

      this.nodeForm = JSON.parse(JSON.stringify({
        id: data.id,
        type: data.type,
        text,
        properties,
      }));
      this.showNodeModal = true;
    },
    getConnectedRecommenders(nodeId) {
      const graphData = this.lf.getGraphData();
      const nodeMap = graphData.nodes.reduce((acc, n) => ({ ...acc, [n.id]: n }), {});
      const recommenders = [];

      graphData.edges.forEach((edge) => {
        if (edge.targetNodeId === nodeId) {
          const sourceNode = nodeMap[edge.sourceNodeId];
          if (sourceNode) {
            const name = this.getRecommenderName(sourceNode);
            if (name) recommenders.push(name);
          }
        }
      });
      return recommenders;
    },
    getRecommenderName(sourceNode) {
      if (sourceNode.type === 'latest') {
        return 'latest';
      } else if (sourceNode.type === 'collaborative') {
        return 'collaborative';
      } else if (sourceNode.type === 'external') {
        return sourceNode.properties && sourceNode.properties.name ? `external/${sourceNode.properties.name}` : null;
      }
      const p = sourceNode.properties;
      if (p && p.name) {
        if (sourceNode.type === 'non-personalized') {
          return `non-personalized/${p.name}`;
        } else if (sourceNode.type === 'user-to-user') {
          return `user-to-user/${p.name}`;
        } else if (sourceNode.type === 'item-to-item') {
          return `item-to-item/${p.name}`;
        }
      }

      return null;
    },
    moveRecommender(index, direction) {
      const list = this.nodeForm.properties.recommenders;
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < list.length) {
        const item = list.splice(index, 1)[0];
        list.splice(newIndex, 0, item);
      }
    },
    syncNodeName(name) {
      this.nodeForm.text = name;
      if (this.nodeForm.properties) {
        this.nodeForm.properties.name = name;
      }
      if (this.nodeForm.id) {
        this.lf.updateText(this.nodeForm.id, name);
        this.lf.setProperties(this.nodeForm.id, { ...this.nodeForm.properties });
      }
    },
    closeNodeModal() {
      this.showNodeModal = false;
      this.previewUserId = '';
      this.previewResult = null;
      this.previewError = null;
      this.previewLoading = false;
      this.disposeMonaco();
    },
    runExternalScript() {
      this.previewLoading = true;
      this.previewError = null;
      this.previewResult = null;

      const script = this.nodeForm.properties.script || '';
      // Base64 encode the script
      const encodedScript = window.btoa(encodeURIComponent(script).replace(/%([0-9A-F]{2})/g,
        (match, p1) => String.fromCharCode(`0x${p1}`)));

      axios.get('/api/dashboard/external', {
        params: {
          'user-id': this.previewUserId,
          script: encodedScript,
        },
      }).then((response) => {
        this.previewResult = JSON.stringify(response.data, null, 2);
      }).catch((error) => {
        this.previewError = error.message;
      }).finally(() => {
        this.previewLoading = false;
      });
    },
    updateNode() {
      if (this.nodeForm.id) {
        // Sync text from name for relevant types
        const rec = this.nodeForm.properties;
        if (rec) {
          if (['user-to-user', 'item-to-item', 'non-personalized', 'external'].includes(this.nodeForm.type)) {
            this.nodeForm.text = rec.name;
          }
        }
        this.lf.updateText(this.nodeForm.id, this.nodeForm.text);
        this.lf.setProperties(this.nodeForm.id, { ...this.nodeForm.properties });
      }
      this.closeNodeModal();
    },
    exportFlow() {
      this.syncGraphToConfig();
      this.exportData = this.jsonToToml({ recommend: this.config.recommend });
      this.showExportModal = true;
    },
    async initMonaco() {
      try {
        this.monacoError = '';
        if (!this.monaco) {
          this.monaco = await import('monaco-editor');
        }
        const monaco = this.monaco;
        const container = this.$refs.monacoEditor;
        if (!container) return;
        if (this.monacoEditor) {
          this.monacoEditor.setValue(this.nodeForm.properties.script || '');
          return;
        }
        this.monacoEditor = monaco.editor.create(container, {
          value: this.nodeForm.properties.script || '',
          language: 'javascript',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          theme: 'vs',
        });
        this.monacoEditor.onDidChangeModelContent(() => {
          this.nodeForm.properties.script = this.monacoEditor.getValue();
        });
      } catch (err) {
        this.monacoError = err.message || 'Failed to load Monaco editor';
      }
    },
    disposeMonaco() {
      if (this.monacoEditor) {
        this.monacoEditor.dispose();
        this.monacoEditor = null;
      }
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
        external: [],
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
        if (!props) return;

        if (node.type === 'data-source') {
          newRecommend.data_source = { ...props };
          delete newRecommend.data_source.fixedName;
        } else if (node.type === 'collaborative') {
          newRecommend.collaborative = { ...props };
          delete newRecommend.collaborative.fixedName;
        } else if (node.type === 'non-personalized') {
          newRecommend['non-personalized'].push({ ...props });
        } else if (node.type === 'user-to-user') {
          newRecommend['user-to-user'].push({ ...props });
        } else if (node.type === 'item-to-item') {
          newRecommend['item-to-item'].push({ ...props });
        } else if (node.type === 'external') {
          newRecommend.external.push({ ...props });
        } else if (node.type === 'recommend') {
          if (props.cache_size !== undefined) newRecommend.cache_size = props.cache_size;
          if (props.cache_expire !== undefined) newRecommend.cache_expire = props.cache_expire;
          if (props.active_user_ttl !== undefined) newRecommend.active_user_ttl = props.active_user_ttl;
          if (props.context_size !== undefined) newRecommend.context_size = props.context_size;
          if (props.replacement) newRecommend.replacement = props.replacement;
          if (props.external) newRecommend.external = props.external;
        } else if (node.type === 'ranker') {
          Object.assign(newRecommend.ranker, props);
          delete newRecommend.ranker.fixedName;
          newRecommend.ranker.recommenders = [];
        } else if (node.type === 'fallback') {
          Object.assign(newRecommend.fallback, props);
          delete newRecommend.fallback.fixedName;
          newRecommend.fallback.recommenders = [];
        }
      });

      // 2. Process Edges for Ranker/Fallback
      // Map node IDs to their types/content
      const nodeMap = {};
      data.nodes.forEach((node) => {
        nodeMap[node.id] = node;
      });

      // Build connections map
      const connections = { ranker: [], fallback: [] };

      data.edges.forEach((edge) => {
        const targetNode = nodeMap[edge.targetNodeId];
        const sourceNode = nodeMap[edge.sourceNodeId];
        if (!targetNode || !sourceNode) return;

        let targetType = '';
        if (targetNode.type === 'ranker') {
          targetType = 'ranker';
        } else if (targetNode.type === 'fallback') {
          targetType = 'fallback';
        }

        if (targetType) {
          const recName = this.getRecommenderName(sourceNode);
          if (recName) {
            connections[targetType].push(recName);
          }
        }
      });

      // Assign to config with property order respect
      ['ranker', 'fallback'].forEach((type) => {
        const connected = connections[type];
        // Find the corresponding node in graph data to get properties
        const node = data.nodes.find(n => n.type === type);
        let finalOrder = [];

        if (node && node.properties && node.properties.recommenders) {
          // Use saved order, filter out disconnected
          finalOrder = node.properties.recommenders.filter(r => connected.includes(r));
          // Append any new connections not in saved order
          connected.forEach((r) => {
            if (!finalOrder.includes(r)) {
              finalOrder.push(r);
            }
          });
        } else {
          finalOrder = connected;
        }

        // De-duplicate just in case
        newRecommend[type].recommenders = [...new Set(finalOrder)];
      });

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
    getUniqueName(baseName, type) {
      const nodes = this.lf.getGraphData().nodes;
      const existingNames = new Set();

      nodes.forEach((node) => {
        if (node.type !== type) return;
        const props = node.properties || {};
        if (props.name) {
          existingNames.add(props.name);
        } else if (node.text) {
          const text = typeof node.text === 'object' ? node.text.value : node.text;
          existingNames.add(text);
        }
      });

      let uniqueName = baseName;
      let counter = 1;
      while (existingNames.has(uniqueName)) {
        uniqueName = `${baseName}_${counter}`;
        counter += 1;
      }
      return uniqueName;
    },
    drop(e) {
      e.preventDefault();
      const type = e.dataTransfer.getData('type');
      if (type) {
        if (type === 'latest') {
          const nodes = this.lf.getGraphData().nodes;
          if (nodes.some(node => node.type === 'latest')) {
            this.showDanger('Latest node already exists');
            return;
          }
        } else if (type === 'collaborative') {
          const nodes = this.lf.getGraphData().nodes;
          if (nodes.some(node => node.type === 'collaborative')) {
            this.showDanger('Collaborative node already exists');
            return;
          }
        }

        const { x, y } = this.lf.getPointByClient(e.clientX, e.clientY).canvasOverlayPosition;
        const newNode = {
          type,
          x,
          y,
          text: type,
          properties: {},
        };

        if (type === 'latest') {
          newNode.text = 'Latest';
          newNode.properties = { readOnly: true };
        } else if (type === 'collaborative') {
          newNode.text = 'Collaborative';
          newNode.properties = {
            fixedName: true,
            fit_period: '60m',
            fit_epoch: 10,
            optimize_period: '60m',
            optimize_trials: 10,
            early_stopping: {
              patience: 10,
            },
          };
        } else if (type === 'non-personalized') {
          const name = this.getUniqueName('new_non_personalized', type);
          newNode.text = name;
          newNode.properties = {
            name,
            score: '',
            filter: '',
          };
        } else if (type === 'user-to-user') {
          const name = this.getUniqueName('new_user_to_user', type);
          newNode.text = name;
          newNode.properties = {
            name,
            type: 'items',
          };
        } else if (type === 'item-to-item') {
          const name = this.getUniqueName('new_item_to_item', type);
          newNode.text = name;
          newNode.properties = {
            name,
            type: 'embedding',
            column: 'item.Labels.embedding',
          };
        } else if (type === 'external') {
          const name = this.getUniqueName('new_external', type);
          newNode.text = name;
          newNode.properties = {
            name,
            script: '',
          };
        }

        // Generate a random ID
        newNode.id = Math.random().toString(36).substr(2, 9);
        this.lf.addNode(newNode);

        if (['non-personalized', 'user-to-user', 'item-to-item', 'latest', 'collaborative', 'external'].includes(type)) {
          this.lf.addEdge({
            sourceNodeId: 'data-source',
            targetNodeId: newNode.id,
            sourceAnchorId: 'data-source_1',
            targetAnchorId: `${newNode.id}_3`,
            type: 'bezier',
          });
        }
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

.monaco-container {
  height: 260px;
  border: 1px solid #e1e5eb;
  border-radius: 4px;
}
</style>
