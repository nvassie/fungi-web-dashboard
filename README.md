# Fungi Dashboard

A browser-based dashboard for uploading electrical signal recordings, visualising time-series data, detecting spikes, manually annotating spike ranges, and exporting spike data for analysis.

## Tech stack

- React 19 + TypeScript
- Vite
- Dockview for resizable dashboard panels
- uPlot and Plotly for charts
- Jotai for state and local-storage persistence
- Tailwind CSS and Radix/shadcn-style UI components
- Web Workers via Comlink for custom functions and spike processing

## Prerequisites

Install Node.js and npm or pnpm. This project uses Vite 7, so use a recent Node.js version, preferably Node 20.19+ or Node 22.12+. **Additionally, pnpm has been used as the package manager for this project, so it is recommended to be used.**

Check your versions:

```bash
node --version
npm --version

# optional: check pnpm
pnpm --version
```

If you want to use pnpm, install it with:

```bash
npm install -g pnpm
```

## Getting started

From the project directory:

Using npm:

```bash
npm install
npm run dev
```

Or using pnpm:

```bash
pnpm install
pnpm dev
```

Vite will print a local development URL, usually:

```text
http://localhost:5173/
```

Open that URL in your browser to use the dashboard.

## Available scripts

```bash
npm run dev
# or
pnpm dev
```

Starts the local development server with hot-module reload.

```bash
npm run build
# or
pnpm build
```

Runs the TypeScript build and creates a production build in `dist/`.

```bash
npm run preview
# or
pnpm preview
```

Serves the production build locally for previewing.

```bash
npm run lint
# or
pnpm lint
```

Runs ESLint over the project.

## How to use the dashboard

### 1. Upload signal data

Open a Graph panel and upload an electrical signals file. The app supports:

- `.lvm` files with whitespace-separated values
- `.csv` files with comma-separated values

The first column is treated as time intervals. The dashboard converts those intervals into Unix timestamps using the recording date and start time that you enter during upload.

For `.lvm` files, filenames in this format can auto-fill date and start time:

```text
name_yy-mm-dd_hhmm.lvm
```

Example:

```text
sample_26-04-21_1430.lvm
```

During upload you can also:

- enter or edit the recording start time
- enter or edit the recording date
- use headers from the file, or provide your own comma-separated headers
- choose whether to run custom processing functions on upload

### 2. View and control graphs

After upload, the Graph panel plots the uploaded channels against time. Graph controls include:

- graph height slider
- zoom in
- zoom out
- reset zoom
- clear data
- add additional synced graphs inside the same panel

Additional graphs use the same upload workflow and share cursor synchronisation with the main graph.

### 3. Detect spikes

Each Graph panel has a spike-detection function selector and a **Detect Spikes** button.

The default spike detector uses a rolling-window mean and standard deviation threshold. You can add more spike-detection functions in the User Settings panel.

Spike-detection functions receive one channel of numeric input and must return an array of indexes that represent detected spike samples.

Example function body:

```js
const window = 2000;
const threshold = 5;
const spikes = [];

for (let i = window; i < input.length; i++) {
  const slice = input.slice(i - window, i);
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  const std = Math.sqrt(
    slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length,
  );

  if (Math.abs(input[i] - mean) > threshold * std) {
    spikes.push(i);
  }
}

return spikes;
```

### 4. Review spikes

Add a Spike Panel from the panel menu, then select the Graph panel whose spikes you want to inspect.

The Spike Panel provides:

- summary rows by channel
- count of spikes per channel
- individual spike rows with start time, duration, type, and delete controls
- a raster spike plot
- manual spike selection controls
- CSV export for spike data

### 5. Add manual spikes

Manual spike ranges can be added in the Spike Panel by selecting a channel and entering start/end times.

You can also click directly on the graph:

1. Select the target graph in the Spike Panel.
2. Click **Select on Graph**.
3. Click once on the graph for the start time.
4. Click again for the end time.
5. Add or clear the selection from the Spike Panel.

Manual spikes are retained when automatic detection is rerun for the same graph panel.

### 6. Export spike data

The Spike Panel can export CSV files for detected spikes. Exports include spike timing and associated channel values. If additional graphs are attached to the selected Graph panel, their values can also be included when matching timestamps or spike ranges are available.

### 7. Configure custom functions

Open a User Settings panel to manage custom JavaScript functions.

There are two categories:

#### Spike Detection functions

Used by the Graph panel's **Detect Spikes** button. These functions operate on one channel at a time and return spike indexes.

#### Custom data-processing function groups

Used during upload when **Run custom functions on upload** is enabled. Function groups can be ordered by drag-and-drop, and one function from each group can be selected to run in sequence.

These functions receive numeric arrays and should return transformed numeric arrays. They can be used for operations such as normalisation, filtering, or other preprocessing.

Custom functions are saved in browser local storage.

## Layout persistence

The dashboard uses Dockview panels. You can add Graph, Spike, and User Settings panels from the plus button in the panel header.

Click **Save Layout** in the top bar to save the current panel layout to browser local storage. The saved layout is restored on the next visit in the same browser.

## Data and browser storage

The app stores user-defined functions, function order, and saved layout in browser local storage. Uploaded file data is held in browser state while the dashboard is open and is cleared when you clear data or refresh without re-uploading.

## Important security note

Custom functions are executed in the browser using dynamically created JavaScript functions. Only run code that you trust. Do not paste untrusted code into spike-detection or data-processing functions.

## Troubleshooting

### `npm install` fails

Make sure you are using a recent Node.js version. If issues persist, delete `node_modules` and reinstall:

Using npm:

```bash
rm -rf node_modules package-lock.json
npm install
```

Using pnpm:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### npm warnings

If a vulnerabilites is displayed when running `npm install`, run npm audit fix --force to fix vulnerabilites.

```bash
added 585 packages, and audited 586 packages in 43s 78 

packages are looking for funding run 
npm fund for details 

4 vulnerabilities (2 moderate, 2 high) 

To address all issues (including breaking changes), run:    npm audit fix --force 

Run npm audit for details.
```
If an allow-scripts warning is displayed when running `npm install`, consider running the commands provided in the warning or using pnpm, otherwise the dashboard might not work as intended.

```bash
npm warn allow-scripts 2 packages have install scripts not yet covered by allowScripts: 
npm warn allow-scripts es5-ext@0.10.64 (postinstall: node -e "try{require('./_postinstall')}catch(e){}" || exit 0) 
npm warn allow-scripts esbuild@0.27.7 (postinstall: node install.js) 
npm warn allow-scripts 
npm warn allow-scripts Run npm approve-scripts --allow-scripts-pending to review, or npm approve-scripts <pkg> to allow.
```

### The dashboard opens but no data appears

Check that:

- the uploaded file is `.lvm` or `.csv`
- the recording date and start time are set
- headers are present or manually entered
- the first column contains numeric time intervals
- the remaining columns contain numeric channel data

### Spike detection returns no spikes

Try a different detection function or adjust the rolling window and threshold in a custom spike-detection function.

### Saved layout looks wrong

Open the browser developer tools and clear local storage for the site.