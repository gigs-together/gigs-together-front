'use client';

import { Admin, Resource } from 'react-admin';
import { dataProvider } from '@/lib/data-provider';
import { authProvider } from '@/lib/auth-provider';
import { UserList, UserEdit, UserCreate, UserShow } from '@/app/admin/_components/UserResource';
import {
  EventList,
  EventEdit,
  EventCreate,
  EventShow,
} from '@/app/admin/_components/EventResource';
import Dashboard from '@/app/admin/_components/Dashboard';

const AdminApp = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    dashboard={Dashboard}
    title="Gigs Together Admin"
    requireAuth
  >
    <Resource
      name="users"
      list={UserList}
      edit={UserEdit}
      create={UserCreate}
      show={UserShow}
      recordRepresentation="email"
    />
    <Resource
      name="events"
      list={EventList}
      edit={EventEdit}
      create={EventCreate}
      show={EventShow}
      recordRepresentation="title"
    />
  </Admin>
);

export default AdminApp;
