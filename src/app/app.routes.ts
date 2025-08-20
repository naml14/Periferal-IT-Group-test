import { Routes } from '@angular/router';
import { Contacts } from './components/contacts/contacts';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/contacts',
  },
  {
    path: 'contacts',
    component: Contacts,
    title: 'Gestión de Contactos',
  },
  {
    path: '**',
    redirectTo: '/contacts',
  },
];
