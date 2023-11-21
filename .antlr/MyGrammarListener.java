// Generated from /Users/terence/Code/edgedb-stuff/MyGrammar.g4 by ANTLR 4.13.1
import org.antlr.v4.runtime.tree.ParseTreeListener;

/**
 * This interface defines a complete listener for a parse tree produced by
 * {@link MyGrammarParser}.
 */
public interface MyGrammarListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#document}.
	 * @param ctx the parse tree
	 */
	void enterDocument(MyGrammarParser.DocumentContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#document}.
	 * @param ctx the parse tree
	 */
	void exitDocument(MyGrammarParser.DocumentContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#definition}.
	 * @param ctx the parse tree
	 */
	void enterDefinition(MyGrammarParser.DefinitionContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#definition}.
	 * @param ctx the parse tree
	 */
	void exitDefinition(MyGrammarParser.DefinitionContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#fragmentDefinition}.
	 * @param ctx the parse tree
	 */
	void enterFragmentDefinition(MyGrammarParser.FragmentDefinitionContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#fragmentDefinition}.
	 * @param ctx the parse tree
	 */
	void exitFragmentDefinition(MyGrammarParser.FragmentDefinitionContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#selectStatement}.
	 * @param ctx the parse tree
	 */
	void enterSelectStatement(MyGrammarParser.SelectStatementContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#selectStatement}.
	 * @param ctx the parse tree
	 */
	void exitSelectStatement(MyGrammarParser.SelectStatementContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#querySelectionSet}.
	 * @param ctx the parse tree
	 */
	void enterQuerySelectionSet(MyGrammarParser.QuerySelectionSetContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#querySelectionSet}.
	 * @param ctx the parse tree
	 */
	void exitQuerySelectionSet(MyGrammarParser.QuerySelectionSetContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#querySelection}.
	 * @param ctx the parse tree
	 */
	void enterQuerySelection(MyGrammarParser.QuerySelectionContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#querySelection}.
	 * @param ctx the parse tree
	 */
	void exitQuerySelection(MyGrammarParser.QuerySelectionContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#potentialFilter}.
	 * @param ctx the parse tree
	 */
	void enterPotentialFilter(MyGrammarParser.PotentialFilterContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#potentialFilter}.
	 * @param ctx the parse tree
	 */
	void exitPotentialFilter(MyGrammarParser.PotentialFilterContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#expression}.
	 * @param ctx the parse tree
	 */
	void enterExpression(MyGrammarParser.ExpressionContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#expression}.
	 * @param ctx the parse tree
	 */
	void exitExpression(MyGrammarParser.ExpressionContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#operatorParts}.
	 * @param ctx the parse tree
	 */
	void enterOperatorParts(MyGrammarParser.OperatorPartsContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#operatorParts}.
	 * @param ctx the parse tree
	 */
	void exitOperatorParts(MyGrammarParser.OperatorPartsContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#leftExpression}.
	 * @param ctx the parse tree
	 */
	void enterLeftExpression(MyGrammarParser.LeftExpressionContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#leftExpression}.
	 * @param ctx the parse tree
	 */
	void exitLeftExpression(MyGrammarParser.LeftExpressionContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#simpleExpression}.
	 * @param ctx the parse tree
	 */
	void enterSimpleExpression(MyGrammarParser.SimpleExpressionContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#simpleExpression}.
	 * @param ctx the parse tree
	 */
	void exitSimpleExpression(MyGrammarParser.SimpleExpressionContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#constant_expression}.
	 * @param ctx the parse tree
	 */
	void enterConstant_expression(MyGrammarParser.Constant_expressionContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#constant_expression}.
	 * @param ctx the parse tree
	 */
	void exitConstant_expression(MyGrammarParser.Constant_expressionContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#function_call}.
	 * @param ctx the parse tree
	 */
	void enterFunction_call(MyGrammarParser.Function_callContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#function_call}.
	 * @param ctx the parse tree
	 */
	void exitFunction_call(MyGrammarParser.Function_callContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#function_arguments}.
	 * @param ctx the parse tree
	 */
	void enterFunction_arguments(MyGrammarParser.Function_argumentsContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#function_arguments}.
	 * @param ctx the parse tree
	 */
	void exitFunction_arguments(MyGrammarParser.Function_argumentsContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#function_argument}.
	 * @param ctx the parse tree
	 */
	void enterFunction_argument(MyGrammarParser.Function_argumentContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#function_argument}.
	 * @param ctx the parse tree
	 */
	void exitFunction_argument(MyGrammarParser.Function_argumentContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#path}.
	 * @param ctx the parse tree
	 */
	void enterPath(MyGrammarParser.PathContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#path}.
	 * @param ctx the parse tree
	 */
	void exitPath(MyGrammarParser.PathContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#operator}.
	 * @param ctx the parse tree
	 */
	void enterOperator(MyGrammarParser.OperatorContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#operator}.
	 * @param ctx the parse tree
	 */
	void exitOperator(MyGrammarParser.OperatorContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#functionCall}.
	 * @param ctx the parse tree
	 */
	void enterFunctionCall(MyGrammarParser.FunctionCallContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#functionCall}.
	 * @param ctx the parse tree
	 */
	void exitFunctionCall(MyGrammarParser.FunctionCallContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#functionArguments}.
	 * @param ctx the parse tree
	 */
	void enterFunctionArguments(MyGrammarParser.FunctionArgumentsContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#functionArguments}.
	 * @param ctx the parse tree
	 */
	void exitFunctionArguments(MyGrammarParser.FunctionArgumentsContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#functionArgument}.
	 * @param ctx the parse tree
	 */
	void enterFunctionArgument(MyGrammarParser.FunctionArgumentContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#functionArgument}.
	 * @param ctx the parse tree
	 */
	void exitFunctionArgument(MyGrammarParser.FunctionArgumentContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#variable}.
	 * @param ctx the parse tree
	 */
	void enterVariable(MyGrammarParser.VariableContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#variable}.
	 * @param ctx the parse tree
	 */
	void exitVariable(MyGrammarParser.VariableContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#cast}.
	 * @param ctx the parse tree
	 */
	void enterCast(MyGrammarParser.CastContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#cast}.
	 * @param ctx the parse tree
	 */
	void exitCast(MyGrammarParser.CastContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#selectionSet}.
	 * @param ctx the parse tree
	 */
	void enterSelectionSet(MyGrammarParser.SelectionSetContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#selectionSet}.
	 * @param ctx the parse tree
	 */
	void exitSelectionSet(MyGrammarParser.SelectionSetContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#type}.
	 * @param ctx the parse tree
	 */
	void enterType(MyGrammarParser.TypeContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#type}.
	 * @param ctx the parse tree
	 */
	void exitType(MyGrammarParser.TypeContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#name}.
	 * @param ctx the parse tree
	 */
	void enterName(MyGrammarParser.NameContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#name}.
	 * @param ctx the parse tree
	 */
	void exitName(MyGrammarParser.NameContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#entity}.
	 * @param ctx the parse tree
	 */
	void enterEntity(MyGrammarParser.EntityContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#entity}.
	 * @param ctx the parse tree
	 */
	void exitEntity(MyGrammarParser.EntityContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#fieldSelection}.
	 * @param ctx the parse tree
	 */
	void enterFieldSelection(MyGrammarParser.FieldSelectionContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#fieldSelection}.
	 * @param ctx the parse tree
	 */
	void exitFieldSelection(MyGrammarParser.FieldSelectionContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#linkedField}.
	 * @param ctx the parse tree
	 */
	void enterLinkedField(MyGrammarParser.LinkedFieldContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#linkedField}.
	 * @param ctx the parse tree
	 */
	void exitLinkedField(MyGrammarParser.LinkedFieldContext ctx);
	/**
	 * Enter a parse tree produced by {@link MyGrammarParser#fragmentSpread}.
	 * @param ctx the parse tree
	 */
	void enterFragmentSpread(MyGrammarParser.FragmentSpreadContext ctx);
	/**
	 * Exit a parse tree produced by {@link MyGrammarParser#fragmentSpread}.
	 * @param ctx the parse tree
	 */
	void exitFragmentSpread(MyGrammarParser.FragmentSpreadContext ctx);
}