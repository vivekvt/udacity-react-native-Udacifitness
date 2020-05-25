import React from 'react';
import {View, Text, TouchableOpacity, Platform, StyleSheet} from 'react-native';
import {getMetricMetaInfo, timeToString, getDailyReminderValue} from '../utils/helpers';
import SliderC from './Slider';
import Steppers from './Steppers';
import DateHeader from './DateHeader';
import TextButton from './TextButton';
import {Ionicons} from '@expo/vector-icons';
import {submitEntry, removeEntry} from '../utils/api';
import {connect} from 'react-redux';
import {addEntry} from '../actions';
import {white, purple} from '../utils/colors';

function SubmitBtn({onPress}){
    return(
        <TouchableOpacity
        style={Platform.OS === ' ios' ? styles.iosSubmitBtn : styles.androidSubmitBtn}
        onPress={onPress}>
            <Text style={styles.submitBtnTxt} >Submit</Text>
        </TouchableOpacity>

    )
}

class AddEntry extends React.Component{

    state={
        run:0,
        bike:0,
        swim:0,
        eat:0,
        sleep:0,
    }

    increment=(metric)=>{
        const {max, step}=getMetricMetaInfo(metric);
        this.setState((state)=>{
            const count = state[metric] + step;
            return{
                ...state,
                [metric]:count>max ? max : count
            }
        })
    }

    decrement=(metric)=>{
        const {step}=getMetricMetaInfo(metric);
        this.setState((state)=>{
            const count = state[metric] - step;
            return{
                ...state,
                [metric]:count<0 ? 0 : count
            }
        })
    }

    slide=(metric, value)=>{
        this.setState({
            [metric]:value,
        });
    }

    submit=()=>{
        const key = timeToString();
        const entry = this.state;
        this.props.dispatch(addEntry({
            [key]:entry
        }));

        this.setState(()=>({
        run:0,
        bike:0,
        swim:0,
        sleep:0,
        eat:0,
        }))

        submitEntry({key, entry})

    }

    reset=()=>{
        const key = timeToString();
        this.props.dispatch(addEntry({
            [key]:getDailyReminderValue()
        }));
        removeEntry(key);
    }


    render(){
        const metaInfo = getMetricMetaInfo();
        if(this.props.alreadyLogged){
            return(
                <View style={styles.center}>
                    <Ionicons
                    name={Platform.OS === 'ios' ? 'ios-happy' : 'md-happy'}
                    size={100}/>
                    <Text>You already logged your information for today</Text>
                    <TextButton style={{padding:10}} onPress={this.reset}>
                        Reset
                    </TextButton>
                </View>
            )
        }
        return(
            <View style={styles.container}>
                <DateHeader date={(new Date()).toLocaleDateString()} />
               {
               Object.keys(metaInfo).map((key)=>{
                   const {getIcon, type, ...rest }=metaInfo[key];
                   const value = this.state[key]
                return(
                    <View key={key} style={styles.row}>
                        {getIcon()}
                        {type === 'slider'
                        ? <SliderC value={value} onChange={(value)=>this.slide(key,value)}
                        {...rest}
                        />
                        :<Steppers value={value}
                        onIncrement={()=>this.increment(key)}
                        onDecrement={()=>this.decrement(key)}
                        {...rest}
                         />}
                    </View>
                )
               })
               }
               <SubmitBtn onPress={this.submit} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        padding:20,
        backgroundColor:white,
    },
    row:{
        flexDirection:'row',
        flex:1,
        alignItems:'center',
    },
    iosSubmitBtn:{
        backgroundColor:purple,
        padding:10,
        height:45,
        borderRadius:7,
        marginLeft:40,
        marginRight:40,
    },
    androidSubmitBtn:{
        backgroundColor:purple,
        padding:10,
        height:45,
        borderRadius:2,
        marginLeft:30,
        marginRight:30,
        alignSelf:'flex-end',
        alignItems:'center',
        justifyContent:'center',
    },
    submitBtnTxt:{
        color:white,
        fontSize:22,
        textAlign:'center',

    },
    center:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        marginLeft:30,
        marginRight:30,
    }
})

function mapStateToProps(state){
    const key = timeToString();
    return{
        alreadyLogged:state[key] && typeof state[key].today === 'undefined'
    }
}

export default connect(mapStateToProps)(AddEntry);