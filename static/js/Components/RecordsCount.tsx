import React from 'react';

type Props = {
  pageNo: number;
  pageSize: number;
  totalRecords: number;
};

const RecordCount: React.FC<Props> = ({ pageNo, pageSize, totalRecords }) => {

  return <span className="text-sm">
    {totalRecords > 0 ? (
      <>
        Showing <b>
          {(pageNo - 1) * pageSize + 1} - {Math.min(pageNo * pageSize, totalRecords)}
        </b> of <b>{totalRecords}</b> records
      </>
    ) : (
      <>Showing <b>0</b> - <b>0</b> of <b>0</b> records</>
    )}
  </span>;
};

export default RecordCount;