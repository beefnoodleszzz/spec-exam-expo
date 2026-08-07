# Legacy Buy History Mapping

## Legacy Mapping
- **Page**: `BuyHistoryComponent` (src/solution/pages/buy-history-component/buy-history.component.tsx)
- **Service**: `MineService.userBuyRecordList()` (src/solution/model/services/mine.service.ts)
- **API**: `GET examV2/app/order/userBuyRecordList`
- **Fields Used in UI**: 
  - `id`
  - `orderNumber`
  - `stateText` (e.g., 已支付)
  - `examTypeName`
  - `month` (-1 for '永久', otherwise 'x个月')
  - `originalAmount` (总价, in Yuan)
  - `amount` (实付款, in Yuan)
  - `createTime`
- **Pagination**: None. The API returns the full list at once.
- **Interaction**: 
  - No item details click.
  - "发票" button (calls an external phone number via Modal, no real invoice page).
- **Empty State**: Displays an image and "暂无记录".

## Generated Contract
- **Function**: `apiExamV2AppOrderUserBuyRecordListGet`
- **Method**: `GET`
- **Path**: `/api/examV2/app/order/userBuyRecordList`
- **Request**: None.
- **Response**: `DynamicCoreDResult1SystemCollectionsGenericList1Cc62f2cf0176` containing an array of `ExaminationManageContractDtoUserUserOrderBase`.
