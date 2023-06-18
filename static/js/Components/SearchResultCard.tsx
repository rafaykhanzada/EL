import { Badge, Divider } from "@mui/material";
import React from "react";

interface SearchResultCardProps {
  caseDetail: any;
  isCaseSummaryNull: boolean;
  index: number;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ caseDetail, isCaseSummaryNull, index }) => {
  return (
    <Badge
      color="primary"
      badgeContent={index}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      className="w-full"
    >
      <div className="flex flex-col rounded-xl gap-2 bg-stone-50 border border-slate-300 shadow-lg p-4 text-xs hover:border-[#6c5dd3] hover:shadow-xl hover:cursor-pointer w-full">
        <p className="font-bold text-sm hover:text-[#6c5dd3]">{caseDetail.appeallant} vs {caseDetail.respondant}</p>
        <p>{caseDetail.appeal}</p>
        <Divider />
        <div
          dangerouslySetInnerHTML={{
            __html: isCaseSummaryNull ? (caseDetail.judgment === `<p style=\"line-height: 1.2rem\"></p>` ? '<i>No exact match found. Click to see more details.</i>' : caseDetail.judgment) : (caseDetail.case_summary),
          }}
        ></div>
        <Divider />

        <div className="flex flex-row justify-between items-center text-xs">
          <p><b>Court: </b>{caseDetail.court}</p>
          <p><b>Cited by: </b>{caseDetail.referenced_judgments?.length || '0'}</p>
        </div>
        <div className="flex flex-row justify-between items-center text-xs">
          <p><b>Dated: </b>{caseDetail.judgment_date}</p>
          <p><b>Coram: </b>{caseDetail.judges?.length || '0'}</p>
        </div>
      </div>
    </Badge>
  );
}

export default SearchResultCard;