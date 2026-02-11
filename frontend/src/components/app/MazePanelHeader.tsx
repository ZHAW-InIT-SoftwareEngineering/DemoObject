import { ActionButton } from "./ActionButton";


function handleUndoStep() {}

export function MazePanelHeader() {

    // TODO 1.) add the Button to undo 1 path step 
    // TODO 2.) Switch undo button with animate button after submitting the path
    return (
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-600 ring-2 ring-green-900" />
            <span>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-600 ring-2 ring-red-900" />
            <span>End</span>
          </div>
          <ActionButton
            label="Undo Step"
            onClick={handleUndoStep}
            disabled={false}
            fullWidth={false}
            className="ml-2"
          />
        </div>
    )
}
