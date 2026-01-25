import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  ShowButton,
  DeleteButton,
  Create,
  SimpleForm,
  TextInput,
  DateInput,
  NumberInput,
  BooleanInput,
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

const eventFilters = [
  <SearchInput key="q" source="q" placeholder="Search events..." alwaysOn />,
  <BooleanInput key="published" source="published" />,
];

const EventListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

export const EventList = () => (
  <List
    filters={eventFilters}
    actions={<EventListActions />}
    sort={{ field: 'date', order: 'DESC' }}
  >
    <Datagrid>
      <TextField source="id" />
      <TextField source="title" />
      <DateField source="date" />
      <TextField source="venue" />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const EventCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" validate={[required()]} />
      <DateInput source="date" validate={[required()]} />
      <TextInput source="poster" validate={[required()]} />
      <TextInput source="venue" validate={[required()]} />
      <NumberInput source="people" validate={[required()]} />
      <BooleanInput source="published" defaultValue={false} />
      <TextInput source="ticketmasterId" />
    </SimpleForm>
  </Create>
);

export const EventEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" validate={[required()]} />
      <DateInput source="date" validate={[required()]} />
      <TextInput source="poster" validate={[required()]} />
      <TextInput source="venue" validate={[required()]} />
      <NumberInput source="people" validate={[required()]} />
      <BooleanInput source="published" />
      <TextInput source="ticketmasterId" />
    </SimpleForm>
  </Edit>
);

export const EventShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="title" />
      <DateField source="date" />
      <TextField source="poster" />
      <TextField source="venue" />
    </SimpleShowLayout>
  </Show>
);
