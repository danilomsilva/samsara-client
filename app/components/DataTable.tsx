import React, { useState, useEffect } from 'react';
import Cel from './DataTableCel';
import Column from './DataTableColumn';
import InfoIcon from './icons/InfoIcon';
import Tooltip from './Tooltip';
import { type UseSelectedRow, useSelectRow } from '~/stores/useSelectRow';
import CogIcon from './icons/CogIcon';
import { Link } from '@remix-run/react';
import TooltipDisabled from './TooltipDisabled';
import ExclamationTriangle from './icons/ExclamationTriangle';
import { SearchIcon } from './icons/SearchIcon';
import FilterOptions from './FilterOptions';
import ExportOptions from './ExportOptions';
import Pagination from './Pagination';
import { type PaginationType } from '~/utils/consts';

type ColumnType = {
  key: string;
  label: string;
  disabledSort?: boolean;
};

type PropTypes = {
  columns: ColumnType[];
  pagination: PaginationType;
  rows: { [key: string]: string }[] | any;
  path: string;
  id?: string;
};

export default function DataTable({
  columns,
  pagination,
  rows,
  path,
  id,
}: PropTypes) {
  const { selectedRow, setSelectedRow } = useSelectRow() as UseSelectedRow;
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSelectedRow('');
  }, [setSelectedRow]);

  // Function to filter rows based on search query
  const filteredRows = rows.filter((row) => {
    // Check if any of the column values contains the search query
    return columns.some((col) => {
      const columnValue = row[col.key];
      return (
        columnValue &&
        columnValue.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  });

  const columnNames = columns.map((col) => col.key);

  return (
    <div className="w-full h-full overflow-hidden rounded mt-4 pb-14 flex flex-col">
      <div
        className="overflow-y-auto h-full  scrollbar-thin scrollbar-thumb-grey/30 rounded scrollbar-thumb-rounded"
        style={{ scrollbarGutter: 'stable' }}
      >
        {/* Search Input */}
        <div className="flex justify-between mb-px bg-white p-2 gap-2">
          <div className="relative flex w-full">
            <SearchIcon className="absolute top-3 left-2 h-4 w-4" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 focus:outline-blue pl-8 border-grey/50 border rounded-lg w-full max-w-[500px] min-w-[150px] h-10"
            />
          </div>
          {!selectedRow && (
            <div className="flex gap-2">
              <FilterOptions />
              <ExportOptions
                tableHeaders={columns}
                data={rows}
                filename="obra"
              />
            </div>
          )}
        </div>

        {/* Table */}
        <table className="bg-white w-full text-sm" id={id}>
          {/* Table Header */}
          <thead className="sticky top-0 bg-white shadow-md z-10">
            <tr className="text-left h-10">
              {columns.map((col: ColumnType, i: number) => (
                <Column
                  column={col.key}
                  key={i}
                  disabledSort={col.disabledSort ?? false}
                >
                  {col.label}
                </Column>
              ))}
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {filteredRows.length > 0 ? (
              // Render filtered rows
              filteredRows.map((row: any, i: number) => (
                <tr
                  key={i}
                  className={`${row.inativo && 'text-grey/30'} ${
                    selectedRow === row.id && 'bg-blue/20 text-blue'
                  } ${
                    path === '/equipamento_tipo' || path === '/operacao'
                      ? 'h-20'
                      : 'h-10'
                  } border-t-grey-light border-t hover:bg-blue/20 relative`}
                  onClick={() => setSelectedRow(row.id)}
                >
                  {/* Render cells */}
                  {columnNames.map((columnName, j: number) => {
                    const colorsConditions =
                      row.grupo_equipamentoX === 'Máquina' ||
                      row.grupo_equipamentoX === 'Motocicleta'
                        ? 100
                        : row.grupo_equipamentoX === 'Caminhão' ||
                          row.grupo_equipamentoX === 'Automóvel'
                        ? 1000
                        : 100;
                    const revisaoStatusColor =
                      columnName === 'revisao_status' && row[columnName] <= 0
                        ? 'red'
                        : row[columnName] > 0 &&
                          row[columnName] <= colorsConditions
                        ? 'orange'
                        : 'green';

                    if (columnName !== 'id' && row.hasOwnProperty(columnName)) {
                      return (
                        <Cel key={j}>
                          <div className="h-9 flex items-center">
                            {/* Render cell content */}
                            {row.numero_serie &&
                            path === '/equipamento' &&
                            columnName === 'codigo' ? (
                              <div className="flex justify-between items-center w-full mr-1 gap-2">
                                <div className="whitespace-nowrap">
                                  {row[columnName]}
                                </div>
                                <Tooltip
                                  contentClassName="w-[200px] z-50"
                                  content={`Número de série: ${row.numero_serie}`}
                                >
                                  <InfoIcon className="h-6 w-6 text-orange" />
                                </Tooltip>
                              </div>
                            ) : path === '/equipamento' &&
                              columnName === 'revisao_status' ? (
                              <Link
                                to={`/manutencao/new?equip=${row.codigo}`}
                                className={`bg-${revisaoStatusColor} w-fit rounded-lg px-2 py-1 text-white font-semibold items-center justify-center mr-1 whitespace-nowrap`}
                              >
                                {row[columnName]}{' '}
                                {`${
                                  row.instrumento_medicao === 'Horímetro'
                                    ? 'h'
                                    : 'km'
                                }`}
                              </Link>
                            ) : path === '/equipamento_tipo' &&
                              columnName === 'array_operacoes' ? (
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(row[columnName])
                                  ? row[columnName].map((item: any) => {
                                      return (
                                        <Tooltip
                                          key={item}
                                          content={
                                            <>
                                              <p>{item.codigo}</p>
                                              <p>{item.descricao}</p>
                                            </>
                                          }
                                          contentClassName="whitespace-nowrap"
                                        >
                                          <div className="bg-grey/30 rounded-md flex items-center px-1 cursor-default">
                                            {item.codigo}
                                          </div>
                                        </Tooltip>
                                      );
                                    })
                                  : ''}
                              </div>
                            ) : path === '/operacao' &&
                              columnName === 'array_ordens_servico' ? (
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(row[columnName])
                                  ? row[columnName].map((item: any) => {
                                      return (
                                        // TODO: make the position dynamic to screen to avoid cuts
                                        <Tooltip
                                          key={item}
                                          content={
                                            <>
                                              <p>{item.codigo}</p>
                                              <p>{item.descricao}</p>
                                            </>
                                          }
                                          contentClassName="whitespace-nowrap"
                                        >
                                          <div className="bg-grey/30 rounded-md flex items-center px-1 cursor-default">
                                            {item.codigo}
                                          </div>
                                        </Tooltip>
                                      );
                                    })
                                  : ''}
                              </div>
                            ) : columnName === 'boletim' &&
                              path === '/manutencao' &&
                              row[columnName] !== '-' ? (
                              <Link
                                to={`/boletim/${row[columnName]}`}
                                className="text-blue font-semibold cursor-pointer"
                              >
                                {row[columnName]}
                              </Link>
                            ) : (
                              <div className="mr-2 whitespace-nowrap">
                                {typeof row[columnName] === 'boolean' ? (
                                  <div className="flex gap-1 items-center">
                                    <CogIcon />
                                    <p>{row[columnName] ? 'Sim' : 'Não'}</p>
                                  </div>
                                ) : (
                                  row[columnName]
                                )}
                              </div>
                            )}
                          </div>
                        </Cel>
                      );
                    }
                  })}
                  {row.motivo && (
                    <div className="flex items-center justify-center h-10">
                      <TooltipDisabled
                        contentClassName="z-50 -ml-60 w-72"
                        content={
                          <>
                            <p>Motivo da desativação:</p>
                            <p>{row.motivo}</p>
                          </>
                        }
                      >
                        <InfoIcon className="h-6 w-6 text-orange" />
                      </TooltipDisabled>
                    </div>
                  )}
                </tr>
              ))
            ) : (
              // Render placeholder when no results found
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  <div className="my-20 flex flex-col items-center">
                    <ExclamationTriangle className="h-10 w-10 text-grey/70" />
                    <p>Nenhum resultado encontrado!</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination pagination={pagination} />
    </div>
  );
}
