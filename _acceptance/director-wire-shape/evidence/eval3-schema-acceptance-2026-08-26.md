# EVAL-3 — DirectorPlanSchema qua các hãng (26/08/2026, bản cuối)

**Câu hỏi:** schema do `Output.object` sinh (21 ràng buộc) có bị hãng đích từ chối không?
**Ngưỡng đã đặt:** ≥2 hãng có tỉ lệ từ chối 0%.
**Kết quả: 4/4 hãng ĐẠT** sau một bản sửa một dòng.

## Bảng đo — qua AI Gateway (`generateText` + `Output.object`, endpoint `/v4/ai`)

| Hãng | `oneOf` (repo hiện tại) | `anyOf` (sửa 1 dòng) |
|---|---|---|
| `google/gemini-2.5-flash` | ✅ chấp nhận | ✅ chấp nhận |
| `anthropic/claude-sonnet-4.5` | ✅ chấp nhận | ✅ chấp nhận |
| `openai/gpt-5-mini` | ❌ *"'oneOf' is not permitted"* | ✅ chấp nhận |
| `deepseek/deepseek-v3.1` | ✅ chấp nhận | ✅ chấp nhận |

Mọi ca chấp nhận đều trả plan **hợp lệ theo `DirectorPlanSchema`**.

## Bảng đo — gọi THẲNG API từng hãng (không qua gateway)

| Hãng | Kết quả với schema thô |
|---|---|
| OpenAI | `anyOf` ✅ · `oneOf` ❌ |
| Anthropic | ❌ *"'maxItems' is not supported"*; gỡ `maxItems`+`minItems` rồi mới ✅ (chỉ với `anyOf`) |
| Gemini | ❌ liên tiếp: `$schema` → `const` → `additionalProperties` → … (phương ngữ OpenAPI 3.0) |

**Chênh lệch giữa hai bảng chính là giá trị gateway mang lại.**

## Kết luận

1. **Sửa `discriminatedUnion` → `union` tại `src/lib/director/dsl.ts:46`.** Bắt buộc, và là
   blocker DUY NHẤT. `discriminatedUnion` emit `oneOf` — OpenAI cấm qua mọi đường.
   `z.union` emit `anyOf` — bốn hãng đều nhận. Không test nào tham chiếu
   `discriminatedUnion`; `Extract<DirectorStep,{kind:...}>` giữ nguyên.
   Ghi chú: đường Anthropic hiện tại (`zodOutputFormat`) VỐN ĐÃ emit `anyOf`, nên
   `discriminatedUnion` chưa bao giờ mang lợi ích grammar — nó chỉ là mìn chờ đổi transport.

2. **Gateway CÓ chuẩn hoá phương ngữ theo hãng.** Bằng chứng: Gemini từ chối schema thô khi
   gọi thẳng (`$schema`, `const`, `additionalProperties`) nhưng chấp nhận qua gateway.
   Anthropic cũng vậy với `maxItems`. Thứ gateway KHÔNG sửa là `oneOf` — vì đó là khác biệt
   ngữ nghĩa, không phải khác biệt phương ngữ.

3. **KHÔNG cần provider package.** Khuyến nghị gốc — model-string qua gateway — đứng vững.
   `@ai-sdk/gateway` đã có sẵn bắc cầu trong `node_modules`, không phải cài gì thêm.

## Đính chính bản trước

Bản EVAL-3 đầu tiên kết luận *"Gateway KHÔNG chuẩn hoá schema"* và đề xuất chuyển sang
provider package. **SAI.** Nguyên nhân: tài khoản gateway lúc đó ở free tier —
`anthropic/*` trả 403, `google/*` và `deepseek/*` trả `GatewayRateLimitError`. Chỉ `openai/*`
đo được, và OpenAI tình cờ là hãng DUY NHẤT từ chối `oneOf`. Tôi khái quát từ một điểm dữ liệu
mà ba điểm còn lại bị lỗi hạ tầng che mất.

**Bài học đo:** lỗi truy cập và lỗi giới hạn tốc độ KHÔNG phải bằng chứng về hành vi schema.
Phải nạp credit rồi đo lại trước khi kết luận.

## Cách tái lập

```
node eval3-anyof-fix.mjs   "google/gemini-2.5-flash" "anthropic/claude-sonnet-4.5" \
                           "openai/gpt-5-mini" "deepseek/deepseek-v3.1"   # anyOf, 4/4 xanh
node eval3-aisdk-path.mjs  <cùng 4 model>                                  # oneOf, OpenAI đỏ
node eval3-direct-3providers.mjs                                           # gọi thẳng, không gateway
STRIP='$schema,maxItems,minItems' node eval3-direct-3providers.mjs
node schema-diff.mjs                                                       # 21 vs 2 ràng buộc, offline
```
