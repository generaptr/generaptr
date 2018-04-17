import {default as MySql} from './handlers/mysql/Handler';
import DataType from './types/DataType';
import Column from './types/Column';
import Table from './types/Table';
import Schema from './types/Schema';

export const Types = {
  DataType,
  Column,
  Table,
  Schema,
};

export const Handlers = {
  MySql,
  Postgres: '',
  RAML: '',
};
