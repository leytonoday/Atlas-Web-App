import { SECONDARY_COLOUR } from "@/data";
import { Divider, Empty, Spin } from "antd";

/**
 * Represents a column in the SimpleTable component.
 */
export type ISimpleTableColumn = {
  title: string | React.ReactNode;
  dataIndex?: string;
  render: (record: any) => JSX.Element;
  editingRender?: (record: any) => JSX.Element;
  justifyContent?: "center" | "start" | "end";
};

interface ISimpleTableProps {
  dataSource: any[];
  columns: ISimpleTableColumn[];
  isLoading?: boolean;
  selectedRowId?: string | null;
  rowKey: string;
}

/**
 * Used as a replacement for Ant Design's Table component, which is simply terrible in my opinion.
 */
export const SimpleTable = (props: ISimpleTableProps) => {
  return (
    <Spin spinning={props.isLoading}>
      {/* Table Headers */}
      <div
        className="flex w-full items-center justify-between py-3 text-xs md:text-sm"
        style={{
          background: SECONDARY_COLOUR + "77",
          borderBottom: `1px solid ${SECONDARY_COLOUR}`,
        }}
      >
        {/* Displays all columns, with an equal width */}
        {props.columns.map((column, index) => (
          <div
            key={index}
            className={"flex px-2 font-semibold md:px-4"}
            style={{
              width: `${100 / props.columns.length}%`,
              justifyContent: column.justifyContent || "center",
              borderLeft:
                index !== 0 ? `2px solid ${SECONDARY_COLOUR}` : undefined,
            }}
          >
            {column.title}
          </div>
        ))}
      </div>

      {/* Table Rows */}
      {props.dataSource.map((row, rowIndex) => (
        <div key={rowIndex}>
          <div className="flex w-full items-center justify-center py-4">
            {/* Displays all columns, with an equal width */}
            {props.columns.map((column, columnIndex) => (
              <div
                key={columnIndex}
                className={"flex px-4"}
                style={{
                  width: `${100 / props.columns.length || 1}%`,
                  justifyContent: column.justifyContent || "center",
                }}
              >
                {column.editingRender &&
                props.selectedRowId === row[props.rowKey]
                  ? column.editingRender!(row)
                  : column.render(row)}
              </div>
            ))}
          </div>
          <div>
            <Divider className="!my-0" />
          </div>
        </div>
      ))}

      {/* Empty state */}
      {props.dataSource.length === 0 && props.selectedRowId !== "-1" && (
        <>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          <Divider />
        </>
      )}

      {/* New entity row */}
      {props.selectedRowId === "-1" && (
        <>
          <div className="flex w-full py-4">
            {props.columns.map((column, index) => (
              <div
                key={index}
                className={"flex px-4"}
                style={{
                  width: `${100 / props.columns.length || 1}%`,
                  justifyContent: column.justifyContent || "center",
                }}
              >
                {column.editingRender!({})}
              </div>
            ))}
          </div>
          <Divider className="!my-0" />
        </>
      )}
    </Spin>
  );
};
