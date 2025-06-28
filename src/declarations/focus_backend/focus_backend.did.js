export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'addFocusTime' : IDL.Func([IDL.Text, IDL.Nat], [IDL.Bool], []),
    'getAllFocusData' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
        ['query'],
      ),
    'getFocusTime' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
