import { Pagination } from "antd";

export default function CustomPaginationFooter({
  pageIndex,
  pageSize,
  totalRowCount,
  setPageIndex,
  setPageSize,
}: {
  pageIndex: number;
  pageSize: number;
  totalRowCount: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
}): JSX.Element {
  const handlePageChange = (page: number) => {
    setPageIndex(page - 1);
  };

  const handlePageSizeChange = (_current: number, size: number) => {
    setPageSize(size);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Pagination
        current={pageIndex + 1}
        pageSize={pageSize}
        total={totalRowCount}
        onChange={handlePageChange}
        onShowSizeChange={handlePageSizeChange}
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        showSizeChanger
        showQuickJumper
      />
    </div>
  );
}
