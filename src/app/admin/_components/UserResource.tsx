import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  EditButton,
  ShowButton,
  DeleteButton,
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  required,
  Edit,
  Show,
  SimpleShowLayout,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  SearchInput,
} from 'react-admin';

const userFilters = [
  <SearchInput key="q" source="q" placeholder="Search users..." alwaysOn />,
  <SelectInput
    key="role"
    source="role"
    choices={[
      { id: 'admin', name: 'Admin' },
      { id: 'moderator', name: 'Moderator' },
      { id: 'user', name: 'User' },
    ]}
  />,
];

const UserListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export const UserList = () => (
  <List
    filters={userFilters}
    actions={<UserListActions />}
    sort={{ field: 'createdAt', order: 'DESC' }}
  >
    <Datagrid>
      <TextField source="id" />
      <EmailField source="email" />
      <TextField source="firstName" />
      <TextField source="lastName" />
      <TextField source="role" />
      <DateField source="createdAt" showTime />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const UserCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="email" validate={[required()]} />
      <TextInput source="firstName" validate={[required()]} />
      <TextInput source="lastName" validate={[required()]} />
      <TextInput source="password" type="password" validate={[required()]} />
      <SelectInput
        source="role"
        choices={[
          { id: 'admin', name: 'Admin' },
          { id: 'moderator', name: 'Moderator' },
          { id: 'user', name: 'User' },
        ]}
        defaultValue="user"
      />
    </SimpleForm>
  </Create>
);

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="email" validate={[required()]} />
      <TextInput source="firstName" validate={[required()]} />
      <TextInput source="lastName" validate={[required()]} />
      <TextInput
        source="password"
        type="password"
        helperText="Leave blank to keep current password"
      />
      <SelectInput
        source="role"
        choices={[
          { id: 'admin', name: 'Admin' },
          { id: 'moderator', name: 'Moderator' },
          { id: 'user', name: 'User' },
        ]}
      />
    </SimpleForm>
  </Edit>
);

export const UserShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <EmailField source="email" />
      <TextField source="firstName" />
      <TextField source="lastName" />
      <TextField source="role" />
      <DateField source="createdAt" showTime />
    </SimpleShowLayout>
  </Show>
);
