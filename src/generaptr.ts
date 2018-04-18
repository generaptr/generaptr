import {default as MySql} from './handlers/mysql/Handler';

import Schema from './types/Schema';
import Table from './types/Table';
import Column from './types/Column';
import DataType from './types/DataType';
import ForeignKey from './types/ForeignKey';

export const Types = {
  Schema,
  Table,
  Column,
  DataType,
  ForeignKey,
};

export const Handlers = {
  MySql,
};

export default {
  Handlers,
  Types,
};