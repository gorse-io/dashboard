<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4" no-gutters>
      <v-col cols="12" sm="10" class="text-center text-sm-left mb-0 d-flex align-center">
        <div class="d-flex align-center pa-2 me-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'latest')">
          <i class="material-icons me-2 text-primary">new_releases</i>
          <span>Latest</span>
        </div>
        <div class="d-flex align-center pa-2 me-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'collaborative')">
          <i class="material-icons me-2 text-primary">group_work</i>
          <span>Collaborative</span>
        </div>
        <div class="d-flex align-center pa-2 me-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'non-personalized')">
          <i class="material-icons me-2 text-primary">public</i>
          <span>Non-Personalized</span>
        </div>
        <div class="d-flex align-center pa-2 me-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'user-to-user')">
          <i class="material-icons me-2 text-primary">people</i>
          <span>User to User</span>
        </div>
        <div class="d-flex align-center pa-2 me-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'item-to-item')">
          <i class="material-icons me-2 text-primary">apps</i>
          <span>Item to Item</span>
        </div>
        <div class="d-flex align-center pa-2 me-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'external')">
          <i class="material-icons me-2 text-primary">cloud_queue</i>
          <span>External</span>
        </div>
        <div class="d-flex align-center pa-2 me-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'ranker')">
          <i class="material-icons me-2 text-primary">sort</i>
          <span>Ranker</span>
        </div>
        <div class="d-flex align-center pa-2 border rounded bg-white draggable-node" style="cursor: grab;"
          draggable="true" @dragstart="dragStart($event, 'fallback')">
          <i class="material-icons me-2 text-primary">history</i>
          <span>Fallback</span>
        </div>
      </v-col>
      <v-col cols="12" sm="2" class="d-flex align-center justify-sm-end mt-3 mt-sm-0">
        <v-btn color="white" class="me-2" @click="clearFlow">Clear</v-btn>
        <v-btn color="primary" @click="saveFlow">Save</v-btn>
      </v-col>
    </v-row>

    <v-alert
      v-if="timeUntilDismissed > 0"
      :color="alertTheme === 'danger' ? 'error' : alertTheme"
      variant="tonal"
      closable
      @click:close="clearAlertCountdown"
    >{{ alertText }}</v-alert>

    <!-- LogicFlow Container -->
    <v-card class="h-100 position-relative mb-4">
      <v-card-text class="pa-0">
        <!-- LogicFlow Canvas -->
        <div id="container" class="logic-flow-view" @drop="drop" @dragover.prevent></div>
      </v-card-text>
    </v-card>

    <!-- Node Property Modal -->
    <v-dialog
      v-model="showNodeModal"
      :max-width="(nodeForm.type === 'external' || nodeForm.type === 'ranker') ? 1100 : 640"
      @update:modelValue="(value) => { if (!value) closeNodeModal(); }"
    >
      <v-card class="card" variant="flat">
        <v-card-title>
          <h5 class="m-0">{{ modalTitle }}</h5>
        </v-card-title>
        <v-card-text>
        <v-form @submit.prevent="updateNode">
          <!-- Data Source Specific Properties -->
          <template v-if="nodeForm.type === 'data-source'">
            <div class="mb-4">
              <label>Positive Feedback Types (comma separated)</label>
              <v-text-field
                :model-value="nodeForm.properties.positive_feedback_types.join(',')"
                hide-details="auto"
                density="comfortable"
                @update:modelValue="val => nodeForm.properties.positive_feedback_types = String(val ?? '').split(',').map(s => s.trim())"
              />
            </div>
            <div class="mb-4">
              <label>Read Feedback Types (comma separated)</label>
              <v-text-field
                :model-value="nodeForm.properties.read_feedback_types.join(',')"
                hide-details="auto"
                density="comfortable"
                @update:modelValue="val => nodeForm.properties.read_feedback_types = String(val ?? '').split(',').map(s => s.trim())"
              />
            </div>
            <v-row>
              <v-col cols="12" md="6" class="pb-2">
                <label>Positive Feedback TTL</label>
                <v-text-field
                  type="number"
                  :model-value="nodeForm.properties.positive_feedback_ttl"
                  hide-details="auto"
                  density="comfortable"
                  @update:modelValue="val => nodeForm.properties.positive_feedback_ttl = normalizeNumber(val)"
                />
              </v-col>
              <v-col cols="12" md="6" class="pb-2">
                <label>Item TTL</label>
                <v-text-field
                  type="number"
                  :model-value="nodeForm.properties.item_ttl"
                  hide-details="auto"
                  density="comfortable"
                  @update:modelValue="val => nodeForm.properties.item_ttl = normalizeNumber(val)"
                />
              </v-col>
            </v-row>
          </template>

          <!-- Fallback Specific Properties -->
          <template
            v-if="nodeForm.type === 'fallback' && nodeForm.properties.recommenders && nodeForm.properties.recommenders.length">
            <div class="mb-4">
              <label>Recommenders</label>
              <v-list>
                <v-list-item v-for="(rec, index) in nodeForm.properties.recommenders" :key="rec"
                  class="d-flex align-items-center border">
                  <span class="me-auto">{{ rec }}</span>
                  <div class="d-flex align-center ml-2">
                    <v-btn variant="text" @click="moveRecommender(index, -1)" :disabled="index === 0">
                      <i class="material-icons">arrow_upward</i>
                    </v-btn>
                    <v-btn variant="text" @click="moveRecommender(index, 1)"
                      :disabled="index === nodeForm.properties.recommenders.length - 1">
                      <i class="material-icons">arrow_downward</i>
                    </v-btn>
                  </div>
                </v-list-item>
              </v-list>
            </div>
          </template>

          <!-- Recommend Global Properties -->
          <template v-if="nodeForm.type === 'recommend'">
            <v-row>
              <v-col cols="12" md="6" class="pb-2">
                <label>Cache Size</label>
                <v-text-field
                  type="number"
                  :model-value="nodeForm.properties.cache_size"
                  hide-details="auto"
                  density="comfortable"
                  @update:modelValue="val => nodeForm.properties.cache_size = normalizeNumber(val)"
                />
              </v-col>
              <v-col cols="12" md="6" class="pb-2">
                <label>Cache Expire</label>
                <v-text-field v-model="nodeForm.properties.cache_expire" hide-details="auto" density="comfortable" />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6" class="pb-2">
                <label>Active User TTL</label>
                <v-text-field
                  type="number"
                  :model-value="nodeForm.properties.active_user_ttl"
                  hide-details="auto"
                  density="comfortable"
                  @update:modelValue="val => nodeForm.properties.active_user_ttl = normalizeNumber(val)"
                />
              </v-col>
              <v-col cols="12" md="6" class="pb-2">
                <label>Context Size</label>
                <v-text-field
                  type="number"
                  :model-value="nodeForm.properties.context_size"
                  hide-details="auto"
                  density="comfortable"
                  @update:modelValue="val => nodeForm.properties.context_size = normalizeNumber(val)"
                />
              </v-col>
            </v-row>
          </template>

          <!-- Ranker Specific Properties -->
          <template v-if="nodeForm.type === 'ranker'">
            <div class="mb-4">
              <label>Type</label>
              <v-select v-model="nodeForm.properties.type" :items="['fm', 'llm']" hide-details="auto" density="comfortable" />
            </div>
            <div class="mb-4" v-if="nodeForm.properties.type === 'llm'">
              <v-row>
                <v-col cols="12" md="6" class="pb-2">
                  <label>Query Template <a href="https://gorse.io/docs/concepts/ranking.html#large-language-models"
                      target="_blank" class="ms-1"><i class="material-icons">help_outline</i></a></label>
                  <v-textarea
                    v-model="nodeForm.properties.query_template"
                    rows="8"
                    variant="outlined"
                    hide-details="auto"
                    class="mt-2"
                    style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif; font-size: 0.85rem;"
                  />
                  <label class="mt-4">Document Template <a href="https://gorse.io/docs/concepts/ranking.html#large-language-models"
                      target="_blank" class="ms-1"><i class="material-icons">help_outline</i></a></label>
                  <v-textarea
                    v-model="nodeForm.properties.document_template"
                    rows="7"
                    variant="outlined"
                    hide-details="auto"
                    class="mt-2"
                    style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif; font-size: 0.85rem;"
                  />
                </v-col>
                <v-col cols="12" md="6" class="pb-2">
                  <label>Preview</label>
                  <div class="d-flex align-center flex-wrap">
                    <v-text-field
                      placeholder="User ID"
                      v-model="rankerPreviewUserId"
                      hide-details="auto"
                      density="comfortable"
                      class="flex-grow-1"
                    />
                    <div class="d-flex align-center ml-2">
                      <v-btn type="button" color="primary" @click="previewRanker" :disabled="rankerPreviewLoading">
                        <i class="material-icons">play_arrow</i>
                      </v-btn>
                    </div>
                  </div>
                  <v-textarea
                    :model-value="rankerPreviewResult || ''"
                    rows="16"
                    readonly
                    variant="outlined"
                    hide-details="auto"
                    class="mt-2"
                    style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif; font-size: 0.85rem;"
                  />
                </v-col>
              </v-row>
              <div class="mb-4" v-if="rankerPreviewError">
                <v-alert color="error" variant="tonal" class="mt-2">{{ rankerPreviewError }}</v-alert>
              </div>
            </div>
            <template v-else>
              <v-row>
                <v-col cols="12" md="6" class="pb-2">
                  <label>Fit Period</label>
                  <v-text-field v-model="nodeForm.properties.fit_period" hide-details="auto" density="comfortable" />
                </v-col>
                <v-col cols="12" md="6" class="pb-2">
                  <label>Fit Epoch</label>
                  <v-text-field
                    type="number"
                    :model-value="nodeForm.properties.fit_epoch"
                    hide-details="auto"
                    density="comfortable"
                    @update:modelValue="val => nodeForm.properties.fit_epoch = normalizeNumber(val)"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6" class="pb-2">
                  <label>Optimize Period</label>
                  <v-text-field v-model="nodeForm.properties.optimize_period" hide-details="auto" density="comfortable" />
                </v-col>
                <v-col cols="12" md="6" class="pb-2">
                  <label>Optimize Trials</label>
                  <v-text-field
                    type="number"
                    :model-value="nodeForm.properties.optimize_trials"
                    hide-details="auto"
                    density="comfortable"
                    @update:modelValue="val => nodeForm.properties.optimize_trials = normalizeNumber(val)"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6" class="pb-2">
                  <label>Cache Expire</label>
                  <v-text-field v-model="nodeForm.properties.cache_expire" hide-details="auto" density="comfortable" />
                </v-col>
                <v-col cols="12" md="6" class="pb-2">
                  <label>Early Stopping Patience</label>
                  <v-text-field
                    type="number"
                    :model-value="nodeForm.properties.early_stopping.patience"
                    hide-details="auto"
                    density="comfortable"
                    @update:modelValue="val => nodeForm.properties.early_stopping.patience = normalizeNumber(val)"
                  />
                </v-col>
              </v-row>
            </template>
          </template>

          <!-- Collaborative Specific Properties -->
          <template v-if="nodeForm.type === 'collaborative'">
            <v-row>
              <v-col cols="12" md="6" class="pb-2">
                <label>Fit Period</label>
                <v-text-field v-model="nodeForm.properties.fit_period" hide-details="auto" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6" class="pb-2">
                <label>Fit Epoch</label>
                <v-text-field
                  type="number"
                  :model-value="nodeForm.properties.fit_epoch"
                  hide-details="auto"
                  density="comfortable"
                  @update:modelValue="val => nodeForm.properties.fit_epoch = normalizeNumber(val)"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6" class="pb-2">
                <label>Optimize Period</label>
                <v-text-field v-model="nodeForm.properties.optimize_period" hide-details="auto" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6" class="pb-2">
                <label>Optimize Trials</label>
                <v-text-field
                  type="number"
                  :model-value="nodeForm.properties.optimize_trials"
                  hide-details="auto"
                  density="comfortable"
                  @update:modelValue="val => nodeForm.properties.optimize_trials = normalizeNumber(val)"
                />
              </v-col>
            </v-row>
            <div class="mb-4">
              <label>Early Stopping Patience</label>
              <v-text-field
                type="number"
                :model-value="nodeForm.properties.early_stopping.patience"
                hide-details="auto"
                density="comfortable"
                @update:modelValue="val => nodeForm.properties.early_stopping.patience = normalizeNumber(val)"
              />
            </div>
          </template>

          <!-- Non-Personalized Specific Properties -->
          <template v-if="nodeForm.type === 'non-personalized'">
            <div class="mb-4">
              <label>Name</label>
              <v-text-field v-model="nodeForm.properties.name" hide-details="auto" density="comfortable" @update:modelValue="syncNodeName" />
            </div>
            <div class="mb-4">
              <label>Score Formula</label>
              <v-text-field v-model="nodeForm.properties.score" hide-details="auto" density="comfortable" />
            </div>
            <div class="mb-4">
              <label>Filter Expression</label>
              <v-text-field v-model="nodeForm.properties.filter" hide-details="auto" density="comfortable" />
            </div>
          </template>

          <!-- User to User Specific Properties -->
          <template v-if="nodeForm.type === 'user-to-user'">
            <div class="mb-4">
              <label>Name</label>
              <v-text-field v-model="nodeForm.properties.name" hide-details="auto" density="comfortable" @update:modelValue="syncNodeName" />
            </div>
            <div class="mb-4">
              <label>Type</label>
              <v-select v-model="nodeForm.properties.type" :items="['embedding', 'tags', 'items']" hide-details="auto" density="comfortable" />
            </div>
            <div class="mb-4"
              v-if="nodeForm.properties.type === 'embedding' || nodeForm.properties.type === 'tags'">
              <label>Column</label>
              <v-text-field v-model="nodeForm.properties.column" hide-details="auto" density="comfortable" />
            </div>
          </template>

          <!-- Item to Item Specific Properties -->
          <template v-if="nodeForm.type === 'item-to-item'">
            <div class="mb-4">
              <label>Name</label>
              <v-text-field v-model="nodeForm.properties.name" hide-details="auto" density="comfortable" @update:modelValue="syncNodeName" />
            </div>
            <div class="mb-4">
              <label>Type</label>
              <v-select v-model="nodeForm.properties.type" :items="['embedding', 'tags', 'users']" hide-details="auto" density="comfortable" />
            </div>
            <div class="mb-4"
              v-if="nodeForm.properties.type === 'embedding' || nodeForm.properties.type === 'tags'">
              <label>Column</label>
              <v-text-field v-model="nodeForm.properties.column" hide-details="auto" density="comfortable" />
            </div>
          </template>

          <!-- External Recommender Properties -->
          <template v-if="nodeForm.type === 'external'">
            <div class="mb-4">
              <label>Name</label>
              <v-text-field v-model="nodeForm.properties.name" hide-details="auto" density="comfortable" @update:modelValue="syncNodeName" />
            </div>
            <div class="mb-4">
              <label>Script <a href="https://gorse.io/docs/concepts/recommenders/external.html" target="_blank"
                  class="ms-1"><i class="material-icons">help_outline</i></a></label>
              <div ref="monacoEditor" class="monaco-container"></div>
              <small class="text-muted" v-if="monacoError">{{ monacoError }}</small>
            </div>
            <div class="mb-4">
              <div class="d-flex align-center flex-wrap">
                <v-text-field placeholder="User ID" v-model="previewUserId" hide-details="auto" density="comfortable" class="flex-grow-1" />
                <div class="d-flex align-center ml-2">
                  <v-btn type="button" color="primary" @click="runExternalScript" :disabled="previewLoading">
                    <i class="material-icons">play_arrow</i>
                  </v-btn>
                </div>
              </div>
            </div>
            <div class="mb-4" v-if="previewResult || previewError">
              <label>Result</label>
              <pre class="bg-light p-2 rounded border" v-if="!previewError"
                style="max-height: 200px; overflow: auto;">{{ previewResult }}</pre>
              <v-alert v-else color="error" variant="tonal">{{ previewError }}</v-alert>
            </div>
          </template>

          <div class="d-flex align-center justify-end pt-3">
            <div>
              <v-btn type="button" color="secondary" class="me-2" @click="closeNodeModal">Cancel</v-btn>
              <v-btn type="submit" color="primary">Save</v-btn>
            </div>
          </div>
        </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Export Modal -->
    <v-dialog v-model="showExportModal" max-width="640">
      <v-card class="card" variant="flat">
        <v-card-title>
          <h5 class="m-0">Export TOML</h5>
        </v-card-title>
        <v-card-text>
        <v-textarea
          v-model="exportData"
          rows="15"
          variant="outlined"
          hide-details="auto"
          style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif; font-size: 0.85rem;"
        />
        <div class="mt-3 text-right">
          <v-btn class="me-2" color="white" @click="copyExportData">Copy</v-btn>
          <v-btn color="primary" @click="showExportModal = false">Close</v-btn>
        </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
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
    if (['data-source', 'recommend'].includes(type)) {
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
      <div class="d-flex align-center pa-2 elevation-1 rounded border bg-white" style="height: 50px; width: ${width}px; border-color: #007bff !important;">
        <i class="material-icons me-2 text-primary" style="font-size: 20px;">${iconName === 'database' ? 'storage' : iconName}</i>
        <span class="font-weight-bold text-truncate" style="font-size: 14px;">${nodeText}</span>
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
      alertTimerId: null,
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
      rankerPreviewUserId: '',
      rankerPreviewResult: null,
      rankerDocumentPreviewResult: null,
      rankerPreviewError: null,
      rankerPreviewLoading: false,
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
      const sourceModel = this.lf.getNodeModelById(data.sourceNodeId);
      const targetModel = this.lf.getNodeModelById(data.targetNodeId);
      const hasRanker = this.lf.getGraphData().nodes.some(n => n.type === 'ranker');

      if (sourceModel && targetModel && targetModel.type === 'recommend' && this.isRecommenderType(sourceModel.type)) {
        if (hasRanker) {
          this.lf.deleteEdge(data.id);
          this.showDanger('Ranker exists: Recommender nodes must connect to Ranker, not Recommend.');
          return;
        }

        const recommendEdges = this.lf.getGraphData().edges.filter((edge) => {
          if (edge.id === data.id) return false;
          const src = this.lf.getNodeModelById(edge.sourceNodeId);
          return edge.targetNodeId === 'recommend' && src && this.isRecommenderType(src.type);
        });

        if (recommendEdges.length >= 1) {
          this.lf.deleteEdge(data.id);
          this.showDanger('Ranker is disabled: only one Recommender can connect to Recommend.');
          return;
        }
      }

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
      const deletedRankerIds = new Set();

      const graphData = this.lf.getGraphData();
      const rankerIncoming = graphData.edges
        .filter(e => e.targetNodeId === 'ranker')
        .map(e => e.sourceNodeId);

      nodes.forEach((node) => {
        const nodeModel = this.lf.getNodeModelById(node.id);
        if (nodeModel && nodeModel.deletable !== false) {
          if (nodeModel.type === 'ranker') {
            deletedRankerIds.add(node.id);
          }
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

      if (deletedRankerIds.size > 0) {
        const existingRecommendEdges = this.lf.getGraphData().edges.filter((edge) => {
          const src = this.lf.getNodeModelById(edge.sourceNodeId);
          return edge.targetNodeId === 'recommend' && src && this.isRecommenderType(src.type);
        });

        if (existingRecommendEdges.length === 0) {
          const candidate = rankerIncoming.find(sourceId => !deletedNodeIds.has(sourceId));
          if (candidate) {
            this.lf.addEdge({
              sourceNodeId: candidate,
              targetNodeId: 'recommend',
              type: 'bezier',
            });
          }
        }
      }
    });

    axios.get('/api/dashboard/config').then((response) => {
      this.config = response.data;
      this.initGraph();
    }).catch((error) => {
      console.error(error);
    });
  },
  beforeUnmount() {
    this.clearAlertCountdown();
    this.disposeMonaco();
  },
  methods: {
    normalizeNumber(value) {
      const converted = Number(value);
      return Number.isNaN(converted) ? value : converted;
    },
    startAlertCountdown(seconds) {
      this.clearAlertCountdown();
      this.timeUntilDismissed = seconds;
      this.alertTimerId = setInterval(() => {
        if (this.timeUntilDismissed <= 1) {
          this.clearAlertCountdown();
          return;
        }
        this.timeUntilDismissed -= 1;
      }, 1000);
    },
    clearAlertCountdown() {
      if (this.alertTimerId) {
        clearInterval(this.alertTimerId);
        this.alertTimerId = null;
      }
      this.timeUntilDismissed = 0;
    },
    showDanger(message) {
      this.startAlertCountdown(this.duration);
      this.alertTheme = 'danger';
      this.alertText = message;
    },
    showSuccess(message) {
      this.startAlertCountdown(this.duration);
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
      const rankerEnabled = recommend.ranker && recommend.ranker.type !== 'none';
      const collaborativeEnabled = recommend.collaborative && recommend.collaborative.type !== 'none';
      const fallbackHasRecommenders = recommend.fallback
        && Array.isArray(recommend.fallback.recommenders)
        && recommend.fallback.recommenders.length > 0;

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

      if (rankerEnabled) {
        nodes.push({
          id: 'ranker',
          type: 'ranker',
          text: 'Ranker',
          properties: {
            fixedName: true,
            ...recommend.ranker,
          },
        });
      }

      if (fallbackHasRecommenders) {
        nodes.push({
          id: 'fallback',
          type: 'fallback',
          text: 'Fallback',
          properties: {
            fixedName: true,
            ...recommend.fallback,
          },
        });
      }

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
      if (rankerEnabled) {
        edges.push({ sourceNodeId: 'ranker', targetNodeId: 'recommend', type: 'bezier' });
      }
      // Fallback -> Recommend
      if (fallbackHasRecommenders) {
        edges.push({ sourceNodeId: 'fallback', targetNodeId: 'recommend', type: 'bezier' });
      }

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
      if (collaborativeEnabled) {
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

      const rankerRecommenders = (recommend.ranker && recommend.ranker.recommenders) || [];

      if (!rankerEnabled) {
        let directNodeId = null;
        for (let i = 0; i < rankerRecommenders.length; i += 1) {
          const nodeId = sourceNodeMap[rankerRecommenders[i]];
          if (nodeId) {
            directNodeId = nodeId;
            break;
          }
        }
        if (!directNodeId) {
          const fallbackCandidate = Object.values(sourceNodeMap)[0];
          directNodeId = fallbackCandidate || null;
        }

        if (directNodeId) {
          const exists = edges.some(e => e.sourceNodeId === directNodeId && e.targetNodeId === 'recommend');
          if (!exists) {
            edges.push({ sourceNodeId: directNodeId, targetNodeId: 'recommend', type: 'bezier' });
          }
        }
      }

      // 3. Connect Sources to Ranker
      if (rankerEnabled) {
        rankerRecommenders.forEach((rec) => {
          const nodeId = sourceNodeMap[rec];
          if (nodeId) {
            const exists = edges.some(e => e.sourceNodeId === nodeId && e.targetNodeId === 'ranker');
            if (!exists) {
              edges.push({ sourceNodeId: nodeId, targetNodeId: 'ranker', type: 'bezier' });
            }
          }
        });
      }

      // 4. Connect Sources to Fallback
      if (fallbackHasRecommenders) {
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
      }

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

      const properties = data.properties ? { ...data.properties } : {};

      // Ensure data-source has safe defaults so modal renders
      if (data.type === 'data-source') {
        if (!Array.isArray(properties.positive_feedback_types)) {
          properties.positive_feedback_types = [];
        }
        if (!Array.isArray(properties.read_feedback_types)) {
          properties.read_feedback_types = [];
        }
      }

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
    isRecommenderType(type) {
      return ['latest', 'collaborative', 'non-personalized', 'user-to-user', 'item-to-item', 'external']
        .includes(type);
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
      this.rankerPreviewUserId = '';
      this.rankerPreviewResult = null;
      this.rankerDocumentPreviewResult = null;
      this.rankerPreviewError = null;
      this.rankerPreviewLoading = false;
      this.disposeMonaco();
    },
    runExternalScript() {
      this.previewLoading = true;
      this.previewError = null;
      this.previewResult = null;

      const script = this.nodeForm.properties.script || '';
      // Base64 encode the script
      const encodedScript = window.btoa(encodeURIComponent(script).replace(
        /%([0-9A-F]{2})/g,
        (match, p1) => String.fromCharCode(`0x${p1}`),
      ));

      axios.get('/api/dashboard/external', {
        params: {
          'user-id': this.previewUserId,
          script: encodedScript,
        },
      }).then((response) => {
        this.previewResult = JSON.stringify(response.data, null, 2);
      }).catch((error) => {
        if (error.response && error.response.data) {
          this.previewError = error.response.data;
        } else {
          this.previewError = error.message;
        }
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
    previewRanker() {
      this.rankerPreviewLoading = true;
      this.rankerPreviewError = null;
      this.rankerPreviewResult = null;
      this.rankerDocumentPreviewResult = null;

      const queryTemplate = this.nodeForm.properties.query_template || '';
      const encodedQueryTemplate = window.btoa(encodeURIComponent(queryTemplate).replace(
        /%([0-9A-F]{2})/g,
        (match, p1) => String.fromCharCode(`0x${p1}`),
      ));
      const documentTemplate = this.nodeForm.properties.document_template || '';
      const encodedDocumentTemplate = window.btoa(encodeURIComponent(documentTemplate).replace(
        /%([0-9A-F]{2})/g,
        (match, p1) => String.fromCharCode(`0x${p1}`),
      ));

      axios.get('/api/dashboard/ranker/prompt', {
        params: {
          'query-template': encodedQueryTemplate,
          'document-template': encodedDocumentTemplate,
          'user-id': this.rankerPreviewUserId,
        },
        headers: {
          accept: 'application/json',
        },
      }).then((response) => {
        this.rankerPreviewResult = JSON.stringify(response.data, null, 2);
        this.rankerDocumentPreviewResult = null;
      }).catch((error) => {
        if (error.response && error.response.data) {
          this.rankerPreviewError = typeof error.response.data === 'string'
            ? error.response.data
            : JSON.stringify(error.response.data, null, 2);
        } else {
          this.rankerPreviewError = error.message;
        }
        this.rankerDocumentPreviewResult = null;
      }).finally(() => {
        this.rankerPreviewLoading = false;
      });
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
      let hasCollaborativeNode = false;

      data.nodes.forEach((node) => {
        const props = node.properties;
        if (!props) return;

        // Remove layout-only attributes
        delete props.width;
        delete props.height;

        if (node.type === 'data-source') {
          newRecommend.data_source = { ...props };
          delete newRecommend.data_source.fixedName;
        } else if (node.type === 'collaborative') {
          hasCollaborativeNode = true;
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
      const connections = { ranker: [], fallback: [], recommend: [] };

      data.edges.forEach((edge) => {
        const targetNode = nodeMap[edge.targetNodeId];
        const sourceNode = nodeMap[edge.sourceNodeId];
        if (!targetNode || !sourceNode) return;

        let targetType = '';
        if (targetNode.type === 'ranker') {
          targetType = 'ranker';
        } else if (targetNode.type === 'fallback') {
          targetType = 'fallback';
        } else if (targetNode.type === 'recommend') {
          targetType = 'recommend';
        }

        if (targetType) {
          const recName = this.getRecommenderName(sourceNode);
          if (recName) {
            connections[targetType].push(recName);
          }
        }
      });

      // Assign to config with property order respect
      const hasRankerNode = data.nodes.some(n => n.type === 'ranker');
      if (!hasRankerNode) {
        newRecommend.ranker = {
          ...newRecommend.ranker,
          type: 'none',
          recommenders: [],
        };
      }

      if (!hasCollaborativeNode) {
        newRecommend.collaborative = {
          ...(this.config.recommend.collaborative || {}),
          type: 'none',
        };
      }

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

      if (!hasRankerNode) {
        const connected = connections.recommend;
        const unique = [...new Set(connected)];
        newRecommend.ranker.recommenders = unique.length > 0 ? [unique[0]] : [];
      }

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
          if (error.response && error.response.data) {
            this.showDanger(`Failed to save configuration: ${error.response.data}`);
          } else {
            this.showDanger(`Failed to save configuration: ${error.message}`);
          }
        });
    },
    clearFlow() {
      axios.delete('/api/dashboard/config')
        .then(() => axios.get('/api/dashboard/config'))
        .then((response) => {
          this.config = response.data;
          this.initGraph();
          this.showSuccess('Configuration cleared successfully!');
        })
        .catch((error) => {
          if (error.response && error.response.data) {
            this.showDanger(`Failed to clear configuration: ${error.response.data}`);
          } else {
            this.showDanger(`Failed to clear configuration: ${error.message}`);
          }
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
        } else if (type === 'ranker') {
          const nodes = this.lf.getGraphData().nodes;
          if (nodes.some(node => node.type === 'ranker')) {
            this.showDanger('Ranker node already exists');
            return;
          }
        } else if (type === 'fallback') {
          const nodes = this.lf.getGraphData().nodes;
          if (nodes.some(node => node.type === 'fallback')) {
            this.showDanger('Fallback node already exists');
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
            type: 'mf',
            fit_period: '60m',
            fit_epoch: 10,
            optimize_period: '60m',
            optimize_trials: 10,
            early_stopping: {
              patience: 10,
            },
          };
        } else if (type === 'ranker') {
          newNode.text = 'Ranker';
          newNode.properties = {
            fixedName: true,
            type: 'fm',
            query_template: '',
            document_template: '',
            cache_expire: '120h',
            recommenders: ['latest', 'collaborative', 'non-personalized/most_starred_weekly', 'item-to-item/neighbors', 'user-to-user/neighbors'],
            fit_period: '60m',
            fit_epoch: 100,
            optimize_period: '360m',
            optimize_trials: 10,
          };
        } else if (type === 'fallback') {
          newNode.text = 'Fallback';
          newNode.properties = {
            fixedName: true,
            recommenders: [],
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

        if (type === 'ranker') {
          const nodes = this.lf.getGraphData().nodes;
          const recommendNode = nodes.find(node => node.type === 'recommend');
          if (recommendNode) {
            const hasEdge = this.lf.getGraphData().edges.some(edge => edge.sourceNodeId === newNode.id
              && edge.targetNodeId === recommendNode.id);
            if (!hasEdge) {
              this.lf.addEdge({
                sourceNodeId: newNode.id,
                targetNodeId: recommendNode.id,
                type: 'bezier',
              });
            }
          }

          const graphData = this.lf.getGraphData();
          graphData.edges.forEach((edge) => {
            const sourceNode = graphData.nodes.find(n => n.id === edge.sourceNodeId);
            if (!sourceNode || !this.isRecommenderType(sourceNode.type)) return;
            const targetNode = graphData.nodes.find(n => n.id === edge.targetNodeId);
            if (targetNode && targetNode.type === 'recommend') {
              this.lf.deleteEdge(edge.id);
              this.lf.addEdge({
                sourceNodeId: edge.sourceNodeId,
                targetNodeId: newNode.id,
                type: 'bezier',
              });
            }
          });
        }

        if (type === 'fallback') {
          const nodes = this.lf.getGraphData().nodes;
          const recommendNode = nodes.find(node => node.type === 'recommend');
          if (recommendNode) {
            const hasEdge = this.lf.getGraphData().edges.some(edge => edge.sourceNodeId === newNode.id
              && edge.targetNodeId === recommendNode.id);
            if (!hasEdge) {
              this.lf.addEdge({
                sourceNodeId: newNode.id,
                targetNodeId: recommendNode.id,
                type: 'bezier',
              });
            }
          }
        }

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
