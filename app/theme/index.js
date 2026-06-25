// app/theme/index.js
// Single import surface for the design system:  import { colors, spacing, radius, shadow, type } from "../theme";
import colors, { tileColorFor, TILE_PALETTE } from "./colors";
import typography, { type, fonts, sizes, weights } from "./typography";
import layout, { spacing, radius, shadow } from "./layout";

export { colors, tileColorFor, TILE_PALETTE, type, fonts, sizes, weights, spacing, radius, shadow };

const theme = { colors, ...typography, ...layout, type, tileColorFor, TILE_PALETTE };
export default theme;
