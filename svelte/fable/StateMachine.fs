module StateMachine
  type Payload =
  | Animating of float
  | WaitForEvent

  type EventResult =
  | Done
  | NextState of ObjectState

  and ObjectState =
    {
      id: string Option
      tick: (unit -> EventResult) Option
      onPointerMove: (unit -> EventResult) Option
      payload: Payload
    }

  let waitForPointerMove (id: string Option) (onEvent: unit -> unit): ObjectState =
    let onPointerMove (): EventResult =
      onEvent()
      Done
    
    {
      id = id
      tick = None
      onPointerMove = Some onPointerMove
      payload = WaitForEvent
    }

  let linearAnimation (id: string Option) (stepEnd: int) (fromValue: float) (toValue: float): ObjectState =
    let linearInterpolate x1 y1 x2 y2 inputX =
      let xRange = x2 - x1
      let yRange = y2 - y1

      if xRange = 0.0
      then 0.0
      else
        let xFrac = (inputX - x1) / xRange
        let yFrac = xFrac * yRange

        yFrac + y1
    
    let rec stepper (step: int): ObjectState =
      let tick (): EventResult =
        if step < stepEnd
        then stepper (step + 1) |> NextState
        else Done

      let current = linearInterpolate 0.0 fromValue (float stepEnd) toValue (float step)

      {
        id = id
        tick = Some tick
        onPointerMove = None
        payload = Animating current
      }

    stepper 0