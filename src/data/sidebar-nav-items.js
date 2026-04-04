export default function () {
  return [{
    title: 'Overview',
    to: {
      name: 'overview',
    },
    icon: 'show_chart',
  }, {
    title: 'Tasks',
    icon: 'task',
    to: {
      name: 'tasks',
    },
  }, {
    title: 'Cluster',
    icon: 'dns',
    to: {
      name: 'cluster',
    },
  }, {
    title: 'Users',
    icon: 'person',
    to: {
      name: 'users',
    },
  }, {
    title: 'Items',
    icon: 'inventory_2',
    to: {
      name: 'items',
    },
  }, {
    title: 'Advance',
    icon: 'subject',
    to: {
      name: 'advance',
    },
  }, {
    title: 'RecFlow',
    icon: 'build',
    to: {
      name: 'recflow',
    },
  }, {
    title: 'Settings',
    icon: 'settings',
    to: {
      name: 'config',
    },
  }];
}
