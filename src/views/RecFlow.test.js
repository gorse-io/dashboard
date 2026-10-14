import axios from 'axios';
import RecFlow from './RecFlow.vue';

jest.mock('axios');
jest.mock('@logicflow/core', () => ({
  HtmlNode: jest.fn(),
  HtmlNodeModel: jest.fn(),
  BezierEdge: jest.fn(),
  BezierEdgeModel: jest.fn(),
}));
jest.mock('@logicflow/core/dist/index.css', () => ({}));

function editor(ranker) {
  const vm = { ...RecFlow.data(), ...RecFlow.methods };
  vm.config = {
    recommend: {
      data_source: {},
      collaborative: { type: 'none' },
      ranker: { recommenders: ['latest'], ...ranker },
    },
  };
  const graph = vm.generateGraphData();
  vm.lf = { getGraphData: () => graph };
  vm.openNodeModal(graph.nodes.find((node) => node.type === 'ranker'));
  return vm;
}

test.each(['reranker', 'decision'])('%s settings survive editing and saving', (type) => {
  const api = type === 'decision'
    ? { state_template: '{{ user.UserId }}', instructions_template: '{{ item.Comment }}' }
    : { query_template: '{{ user.UserId }}', document_template: '{{ item.Comment }}' };
  const vm = editor({ type, [`${type}_api`]: { ...api, url: 'https://example.com', model: 'model' } });
  expect(vm.nodeForm.properties.reranker_api).toBeDefined();
  expect(vm.nodeForm.properties.decision_api).toBeDefined();
  vm.nodeForm.properties[`${type}_api`].model = 'edited';
  vm.lf.getGraphData().nodes.find((node) => node.type === 'ranker').properties = vm.nodeForm.properties;
  vm.syncGraphToConfig();
  expect(vm.config.recommend.ranker[`${type}_api`]).toEqual({
    ...api, url: 'https://example.com', model: 'edited', auth_token: '',
  });
});

test.each(['reranker', 'decision'])('%s preview uses nested templates and UTF-8 base64', async (type) => {
  const vm = editor({ type });
  const api = type === 'decision'
    ? { state_template: '用户 {{ user.UserId }}', instructions_template: '物品 {{ item.Comment }}' }
    : { query_template: '用户 {{ user.UserId }}', document_template: '物品 {{ item.Comment }}' };
  vm.nodeForm.properties[`${type}_api`] = api;
  vm.rankerPreviewUserId = 'alice';
  axios.get.mockResolvedValue({ data: { Query: 'rendered', Documents: [] } });
  await vm.previewRanker();
  expect(axios.get).toHaveBeenLastCalledWith('/api/dashboard/ranker/prompt', {
    params: {
      'query-template': Buffer.from(Object.values(api)[0]).toString('base64'),
      'document-template': Buffer.from(Object.values(api)[1]).toString('base64'),
      'user-id': 'alice',
    },
    headers: { accept: 'application/json' },
  });
  expect(vm.rankerPreviewResult).toContain('rendered');
  expect(vm.rankerPreviewLoading).toBe(false);
});

test('TOML export includes nested API configuration', () => {
  const toml = RecFlow.methods.jsonToToml({
    recommend: {
      ranker: {
        type: 'decision',
        decision_api: { model: 'model', state_template: '用户\n{{ user.UserId }}' },
      },
    },
  });
  expect(toml).toContain('[recommend.ranker.decision_api]');
  expect(toml).toContain('model = "model"');
  expect(toml).toContain('state_template = "用户\\n{{ user.UserId }}"');
});

test('TOML export escapes template backslashes and quotes', () => {
  const toml = RecFlow.methods.jsonToToml({ state_template: 'line\n{{ "C:\\Users" }}\n"""' });
  expect(toml).toBe('state_template = "line\\n{{ \\"C:\\\\Users\\" }}\\n\\"\\"\\""');
});
