function TaskStates(s) {
  const states = {
    new: "grey",
    allocated: "grey",
    complete: "grey",
    shutdown: "grey",
    remove: "grey",
    dead: "grey",
    pending: "grey",
    assigned: "grey",
    ready: "grey",
    accepted: "grey",
    preparing: "orange",
    starting: "orange",
    running: "green",
    failed: "red",
    rejected: "red"
  };

  return states[s];
}

export default TaskStates;
