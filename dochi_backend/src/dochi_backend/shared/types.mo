module Types {
    public type User = {
        name: Text;
        principal: Text;
        createdAt: Int;
    };

    public type LoginError = {
        #NotFound;
        #AlreadyExists;
        #NotAuthorized;
        #InvalidInput;
    };

    public type LoginResult = {
        #success: User;
        #error: LoginError;
    };
}