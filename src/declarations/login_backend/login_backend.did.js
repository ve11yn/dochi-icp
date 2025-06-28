export const idlFactory = ({ IDL }) => {
  const User = IDL.Record({
    'principal' : IDL.Text,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
  });
  const LoginError = IDL.Variant({
    'InvalidInput' : IDL.Null,
    'NotFound' : IDL.Null,
    'NotAuthorized' : IDL.Null,
    'AlreadyExists' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : User, 'err' : LoginError });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Bool, 'err' : LoginError });
  const AuthResponse = IDL.Record({ 'user' : User, 'isFirstTime' : IDL.Bool });
  const Result_1 = IDL.Variant({ 'ok' : AuthResponse, 'err' : LoginError });
  return IDL.Service({
    'checkUserExists' : IDL.Func([], [IDL.Opt(User)], []),
    'createUserProfile' : IDL.Func([IDL.Text], [Result], []),
    'deleteUserProfile' : IDL.Func([], [Result_2], []),
    'getLoginStats' : IDL.Func(
        [],
        [IDL.Record({ 'canisterMemory' : IDL.Nat, 'totalUsers' : IDL.Nat })],
        ['query'],
      ),
    'getMyProfile' : IDL.Func([], [IDL.Opt(User)], []),
    'getUserProfile' : IDL.Func([IDL.Principal], [IDL.Opt(User)], ['query']),
    'healthCheck' : IDL.Func([], [IDL.Text], ['query']),
    'loginUser' : IDL.Func([], [Result_1], []),
    'updateUserProfile' : IDL.Func([IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
