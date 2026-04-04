import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, md } from 'vuetify/iconsets/md';

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'md',
    aliases,
    sets: {
      md,
    },
  },
  defaults: {
    VBtn: {
      variant: 'flat',
    },
  },
  theme: {
    defaultTheme: 'light',
  },
});
