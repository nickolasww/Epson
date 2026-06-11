import type { TablePaginationConfig } from 'antd';

/**
 * Paginate data on client side
 */
export function paginateData<T>(
  data: T[],
  page: number = 1,
  pageSize: number = 10
) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    paginatedData,
    total: data.length,
    currentPage: page,
    pageSize,
  };
}

/**
 * Make pagination config for Ant Design Table
 */
export function makePaginationConfig(
  total: number,
  currentPage: number,
  pageSize: number,
  onChange: (page: number, pageSize: number) => void
): TablePaginationConfig {
  return {
    current: currentPage,
    pageSize: pageSize,
    total: total,
    showSizeChanger: true,
    showTotal: (total) => `Menampilkan ${total} dari ${total} data`,
    pageSizeOptions: ['5', '10', '20', '50', '100'],
    onChange: onChange,
    position: ['bottomCenter'],
  };
}

/**
 * Get className for pagination item (untuk styling green active state)
 */
export function getPaginationItemClassName(isActive: boolean): string {
  return isActive 
    ? 'ant-pagination-item-active-custom' 
    : '';
}
