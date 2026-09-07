# Notice

OneFlow is a fork of [TongFlow](https://github.com/tong-io/tongflow), copyright
tong-io, licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

This fork is modified and maintained independently. It is not affiliated with,
endorsed by, or supported by tong-io.

Modified starting 2026-07-25.

OneFlow remains licensed under AGPL-3.0; see [`LICENSE`](LICENSE) for the full
license text.

## What this fork changed

The Python SDK under [`sdk/`](sdk) is **modified**, not consumed unchanged. It is
published to PyPI under the distribution name **`oneflow-sdk`**; the import
package name stays `tongflow` so existing plugin code keeps working
(see [ADR-0008](docs/adr/0008-naming-and-distribution.md)). Files under
`sdk/tongflow/` include both upstream files carrying local modifications and
files added by this fork.

The plugin ecosystem is **partly** consumed from upstream. Most entries in
[`config/official-plugins.json`](config/official-plugins.json) resolve to the
upstream organisation and are used as published; a small number are maintained
by this fork under its own origin, using the per-plugin `origin` mechanism
([ADR-0007](docs/adr/0007-sequential-plugin-forking.md)).

Plugin repositories are separate projects with their own repositories and their
own licensing; this notice covers only the contents of this repository.
