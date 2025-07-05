import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker'; // npm i @react-native-picker/picker
import { fetchBanks, verifyBankAccount, requestWithdrawal, clearVerificationResult, clearWithdrawalStatus } from '../store/payment';
import { fetchWalletBalance } from '../store/wallet'; // To refresh balance after withdrawal
import { Box, Heading, VStack } from 'native-base';

const WithdrawalBottomSheet = ({ visible, onClose, currentBalance }) => {
    const dispatch = useDispatch();
    const { riderId } = useSelector(state => state.auth);
    const { 
        banks, banksStatus, banksError,
        verificationResult, verificationStatus, verificationError,
        withdrawalStatus, withdrawalError, withdrawalSuccessMessage
    } = useSelector((state) => state.payment);

    const [amount, setAmount] = useState('');
    const [selectedBankCode, setSelectedBankCode] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [accountName, setAccountName] = useState('');

    useEffect(() => {
        if (visible) {
            dispatch(fetchBanks());
            // Reset states when sheet opens
            dispatch(clearVerificationResult());
            dispatch(clearWithdrawalStatus());
            setIsVerified(false);
            setAccountName('');
            setAmount('');
            // setAccountNumber(''); // Keep account number if user reopens?
        }
    }, [visible, dispatch]);

    useEffect(() => {
        if (verificationStatus === 'succeeded' && verificationResult) {
            if (verificationResult.success && verificationResult.data?.accountName) { // Adjust based on your API response for verify
                setAccountName(verificationResult.data.accountName);
                setIsVerified(true);
                Alert.alert("Success", `Account Verified: ${verificationResult.data.accountName}`);
            } else {
                Alert.alert("Verification Failed", verificationResult.message || "Could not verify account name.");
                setIsVerified(false);
            }
        } else if (verificationStatus === 'failed' && verificationError) {
            Alert.alert("Verification Error", verificationError);
            setIsVerified(false);
        }
    }, [verificationStatus, verificationResult, verificationError]);

    useEffect(() => {
        if (withdrawalStatus === 'succeeded' && withdrawalSuccessMessage) {
            Alert.alert("Success", withdrawalSuccessMessage);
            dispatch(fetchWalletBalance()); // Refresh wallet balance
            onClose(); // Close bottom sheet
        } else if (withdrawalStatus === 'failed' && withdrawalError) {
            Alert.alert("Withdrawal Error", withdrawalError);
        }
    }, [withdrawalStatus, withdrawalSuccessMessage, withdrawalError, dispatch, onClose]);

    const handleVerifyAccount = useCallback(() => {
        if (!selectedBankCode || !accountNumber) {
            Alert.alert("Validation Error", "Please select a bank and enter account number.");
            return;
        }
        dispatch(verifyBankAccount({
            entityType: 'rider',
            accountNumber,
            bankCode: selectedBankCode,
        }));
    }, [dispatch, selectedBankCode, accountNumber]);

    const handleWithdraw = () => {
        if (!isVerified) {
            Alert.alert("Error", "Please verify your bank account first.");
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert("Validation Error", "Please enter a valid amount.");
            return;
        }
        if (parseFloat(amount) > currentBalance) {
            Alert.alert("Validation Error", "Withdrawal amount cannot exceed your current balance.");
            return;
        }

        dispatch(requestWithdrawal({
            amount: parseFloat(amount) * 100, // Assuming API expects amount in kobo/cents
            accountNumber,
            bankCode: selectedBankCode,
            // entityId and entityType are added in the thunk
        }));
    };
    
    const onAccountNumberChange = (text) => {
        setAccountNumber(text);
        if (isVerified) { // If user changes account number, reset verification
            setIsVerified(false);
            setAccountName('');
            dispatch(clearVerificationResult());
        }
    };
    
    const onBankChange = (itemValue) => {
        setSelectedBankCode(itemValue);
        if (isVerified) { // If user changes bank, reset verification
            setIsVerified(false);
            setAccountName('');
            dispatch(clearVerificationResult());
        }
    };


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                    <Heading mb={4} size="lg">Request Withdrawal</Heading>
                    <Text style={styles.balanceText}>Available Balance: ${currentBalance.toFixed(2)}</Text>

                    {banksStatus === 'loading' && <ActivityIndicator />}
                    {banksError && <Text style={styles.errorText}>Error loading banks: {banksError}</Text>}
                    {banks.length > 0 && (
                        <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedBankCode}
                            onValueChange={onBankChange}
                            prompt="Select your bank"
                        >
                            <Picker.Item label="-- Select Bank --" value="" />
                            {banks.map((bank) => (
                                <Picker.Item key={bank.code} label={bank.name} value={bank.code} />
                            ))}
                        </Picker>
                        </View>
                    )}

                    <TextInput
                        style={styles.input}
                        placeholder="Account Number"
                        keyboardType="numeric"
                        value={accountNumber}
                        onChangeText={onAccountNumberChange}
                    />
                    
                    {verificationStatus === 'loading' ? (
                        <ActivityIndicator style={{ marginVertical: 10 }} />
                    ) : isVerified && accountName ? (
                         <Text style={styles.verifiedAccountText}>Verified: {accountName}</Text>
                    ) : (
                        <Button title="Verify Account" onPress={handleVerifyAccount} disabled={!selectedBankCode || !accountNumber || verificationStatus === 'loading'} color="orange"/>
                    )}
                    
                    <TextInput
                        style={[styles.input, { marginTop: 10 }]}
                        placeholder="Amount to Withdraw"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                        editable={isVerified} // Only allow amount input after verification
                    />

                    {withdrawalStatus === 'loading' ? (
                        <ActivityIndicator style={{ marginVertical: 10 }} />
                    ) : (
                        <Button title="Submit Withdrawal" onPress={handleWithdraw} disabled={!isVerified || withdrawalStatus === 'loading'} color="teal" />
                    )}
                     <Box mt={2}>
                        <Button title="Cancel" onPress={onClose} color="gray" />
                    </Box>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%', // Max height for the modal
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        fontSize: 16,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginBottom: 15,
    },
    balanceText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'teal',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    verifiedAccountText: {
        color: 'green',
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center',
    }
});

export default WithdrawalBottomSheet;